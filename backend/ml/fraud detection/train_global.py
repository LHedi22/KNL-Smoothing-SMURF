import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from qdrant import scroll_collection

COLLECTION = "loans_training"
MAX_POINTS = 50000
BATCH = 200


def main():
    vectors = []
    offset = None

    print("Starting Qdrant fetch...")

    while True:
        pts, offset = scroll_collection(COLLECTION, limit=BATCH, offset=offset)

        print("Batch size:", len(pts))

        if len(pts) == 0:
            print("NO POINTS RETURNED FROM QDRANT")
            break

        for p in pts:
            vectors.append(p.vector)
            if len(vectors) >= MAX_POINTS:
                break

        print("Fetched total:", len(vectors))

        if offset is None or len(vectors) >= MAX_POINTS:
            break

    if len(vectors) == 0:
        print("FATAL: Qdrant returned ZERO vectors.")
        return

    X = np.array(vectors)

    print("Vector shape:", X.shape)

    if_model = IsolationForest(
        n_estimators=400,
        contamination=0.005,
        max_samples=256,
        random_state=42
    )

    if_model.fit(X)

    raw = -if_model.score_samples(X)
    lo, hi = np.percentile(raw, 1), np.percentile(raw, 99)

    joblib.dump(if_model, "iforest.pkl")
    joblib.dump({"lo": float(lo), "hi": float(hi)}, "calibration.pkl")

    print("Training complete.")
    print("Artifacts saved.")


if __name__ == "__main__":
    main()
