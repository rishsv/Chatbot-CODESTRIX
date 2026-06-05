def classify_intent(user_query):

    lowered = user_query.lower()

    quiz_keywords = [
        "quiz",
        "test me",
        "check my understanding",
        "evaluate me",
        "ask me questions",
        "give me a quiz"
    ]

    teach_keywords = [
        "roadmap",
        "plan",
        "teach",
        "explain",
        "learn",
        "what is",
        "how",
        "why"
    ]

    if any(keyword in lowered for keyword in quiz_keywords):

        topic = user_query

        if "quiz on" in lowered:
            topic = lowered.split("quiz on")[-1].strip()

        return {
            "intent": "quiz",
            "topic": topic,
            "difficulty": "beginner"
        }

    if any(keyword in lowered for keyword in teach_keywords):

        return {
            "intent": "teach",
            "topic": user_query,
            "difficulty": "beginner"
        }

    return {
        "intent": "teach",
        "topic": user_query,
        "difficulty": "beginner"
    }