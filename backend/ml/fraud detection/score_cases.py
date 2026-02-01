import sys
import os

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))
sys.path.insert(0, BACKEND_DIR)

import pandas as pd
import joblib
import numpy as np

from testcases import normal_case, mild_case, fraud_case

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load artifacts
if_model = joblib.load(os.path.join(BASE_DIR, "iforest.pkl"))
cal = joblib.load(os.path.join(BASE_DIR, "calibration.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.joblib"))


def score_case(case):
    # Raw dict → dataframe
    df = pd.DataFrame([case])

    # Goes through SAME engineering + scaler + encoder
    X_df, _ = vectorizer.transform(df)

    # Convert to numpy (IsolationForest expects ndarray)
    X = X_df.to_numpy()

    raw = -if_model.score_samples(X)[0]

    s = (raw - cal["lo"]) / (cal["hi"] - cal["lo"]) * 100

    score = max(0, min(100, float(s)))
    decision = "FLAG" if score >= 60 else "OK"

    return round(score, 2), decision


def main():
    cases = {
        "NORMAL": normal_case,
        "MILD": mild_case,
        "FRAUD": fraud_case
    }

    for name, case in cases.items():
        score, decision = score_case(case)
        print(f"{name}: {score} → {decision}")


if __name__ == "__main__":
    main()
