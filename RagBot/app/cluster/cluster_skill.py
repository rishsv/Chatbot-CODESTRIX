import pandas as pd

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from backend.app.models import UserProfile


FEATURE_COLUMNS = [
    "average_quiz_score",
    "quizzes_taken",
    "study_consistency",
    "days_active",
    "current_streak",
    "total_sessions",
    "teaching_requests",
    "quiz_requests",
    "total_messages",
    "average_message_length",
    "learning_behavior"]
# CONVERTS USER PROFILES TO VECTORS FOR CLUSTERING
def generate_user_vectors(db):
    profiles = db.query(UserProfile).all()
    behavior_map = {
        "theory_focused": 0,
        "assessment_focused": 1,
        "balanced": 2
    }
    data = []
    users = []
    for p in profiles:
        vector = [
            p.average_quiz_score or 0,
            p.quizzes_taken or 0,
            p.study_consistency or 0,
            p.days_active or 0,
            p.current_streak or 0,
            p.total_sessions or 0,
            p.teaching_requests or 0,
            p.quiz_requests or 0,
            p.total_messages or 0,
            p.average_message_length or 0,
            behavior_map.get(
                p.learning_behavior,
                2
            )]
        data.append(vector)
        users.append(p)
    df = pd.DataFrame(
        data,
        columns=FEATURE_COLUMNS
    )
    return users, df
#CLUSTERING LOGIC
def run_clustering(db):
    users, df = generate_user_vectors(db)
    if len(df) < 2:
        return {
            "message": "Not enough users for clustering"
        }
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df)
    n_clusters = min(5, len(df))
    model = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10
    )
    clusters = model.fit_predict(scaled_data)
    df["cluster"] = clusters
    cluster_summary = df.groupby("cluster").mean()
    # SKILL SCORE CALCULATION
    cluster_summary["skill_score"] = (
        cluster_summary["average_quiz_score"] * 0.4 +
        cluster_summary["study_consistency"] * 0.2 +
        cluster_summary["quizzes_taken"] * 0.2 +
        cluster_summary["total_sessions"] * 0.2
    )
    # SORT CLUSTERS BY SKILL
    sorted_clusters = cluster_summary.sort_values(
        "skill_score"
    )
    # SKILL LABELS
    skill_labels = [
        "Newbie",
        "Beginner",
        "Intermediate",
        "Advanced Intermediate",
        "Advanced"
    ]
    # DYNAMIC CLUSTER LABEL MAP
    cluster_label_map = {}
    for i, cluster_id in enumerate(sorted_clusters.index):
        cluster_label_map[int(cluster_id)] = skill_labels[i]
    # CLUSTER TRAITS
    cluster_traits = {}
    for cluster_id in cluster_summary.index:
        traits = interpret_cluster(
            cluster_summary.loc[cluster_id]
        )
        cluster_traits[int(cluster_id)] = traits
    results = []
    for i, user in enumerate(users):
        cluster_id = int(clusters[i])
        skill_label = cluster_label_map[cluster_id]
        user.learning_cluster = cluster_id
        user.skill_label = skill_label
        results.append({
            "user_id": str(user.user_id),
            "cluster": cluster_id,
            "skill_label": skill_label,
            "traits": cluster_traits[cluster_id]
        })
    print(results)
    db.commit()
    return {
        "clusters": results,
        "cluster_summary":
            cluster_summary.to_dict(),
        "cluster_traits":
            cluster_traits,
        "cluster_labels":
            cluster_label_map
    }

#PROVIDES ADDITIONAL TRAITS THE USER CARRIED ON TO GIVE THEM ADAPTIVE LEARNING EXPERIENCE

def interpret_cluster(cluster_row):
    traits = []
    if cluster_row["average_quiz_score"] > 70:
        traits.append("high quiz performance")

    if cluster_row["study_consistency"] > 60:
        traits.append("consistent learners")

    if cluster_row["quiz_requests"] > cluster_row["teaching_requests"]:
        traits.append("assessment oriented")

    if cluster_row["teaching_requests"] > cluster_row["quiz_requests"]:
        traits.append("theory focused")

    if cluster_row["average_message_length"] > 25:
        traits.append("deep interaction style")

    if cluster_row["total_sessions"] > 10:
        traits.append("high engagement")

    if not traits:
        traits.append("balanced learners")

    return traits

#NOT USED IN PRODUCTION - FOR TESTING THE CLUSTERS TO LABEL THEM FOR SKILL LEVEL ASSESSMENT

def test_clustering(df):
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df)
    model = KMeans(
        n_clusters=5,
        random_state=42,
        n_init=10
    )
    clusters = model.fit_predict(scaled_data)
    df["cluster"] = clusters
    cluster_summary = df.groupby("cluster").mean()
    cluster_summary["skill_score"] = (
        cluster_summary["average_quiz_score"] * 0.4 +
        cluster_summary["study_consistency"] * 0.2 +
        cluster_summary["quizzes_taken"] * 0.2 +
        cluster_summary["total_sessions"] * 0.2
    )

    sorted_clusters = cluster_summary.sort_values(
        "skill_score"
    )
    skill_labels = [
        "Newbie",
        "Beginner",
        "Intermediate",
        "Advanced Intermediate",
        "Advanced"
    ]

    cluster_label_map = {}
    for i, cluster_id in enumerate(sorted_clusters.index):
        cluster_label_map[int(cluster_id)] = skill_labels[i]
    print(df)
    print("\nCluster Centers:\n")
    print(model.cluster_centers_)
    print("\nCluster Summary:\n")
    print(cluster_summary)
    print("\nCluster Labels:\n")
    print(cluster_label_map)

    return df