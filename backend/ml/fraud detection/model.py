from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

def train_model(df):

    X = df.values

    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=300,
        contamination=0.005,
        random_state=42
    )

    model.fit(Xs)

    return model, scaler


def score(model, scaler, x):

    xs = scaler.transform([x])

    raw = model.decision_function(xs)[0]

    score = (0.5 - raw) * 100

    return max(0, min(100, score))
