import pandas as pd

NUMERIC = [
    "loan_amnt", "annual_inc", "emp_length", "open_acc", "total_acc", "mort_acc",
    "delinq_2yrs", "acc_now_delinq", "pub_rec", "pub_rec_bankruptcies", "tax_liens",
    "collections_12_mths_ex_med", "inq_last_6mths", "revol_bal", "tot_cur_bal",
    "total_bal_ex_mort", "avg_cur_bal", "open_acc_6m", "acc_open_past_24mths"
]

ENGINEERED = [
    "open_account_ratio",
    "severe_credit_event",
    "inquiry_density"
]

TERM = ["term_36", "term_60"]

VERIFY = [
    "verification_NotVerified",
    "verification_SourceVerified",
    "verification_Verified"
]

HOME = ["home_RENT", "home_MORTGAGE", "home_OWN"]

PURPOSE = [
    "purpose_credit_card",
    "purpose_debt_consolidation",
    "purpose_home_improvement",
    "purpose_major_purchase",
    "purpose_small_business",
    "purpose_car",
    "purpose_other"
]

VECTOR_COLUMNS = NUMERIC + ENGINEERED + TERM + VERIFY + HOME + PURPOSE


def preprocess_raw(app):
    df = pd.DataFrame([app])

    for c in NUMERIC:
        df[c] = df.get(c, 0)

    df["open_account_ratio"] = df["open_acc"] / (df["total_acc"] + 1)

    df["severe_credit_event"] = (
        (df["pub_rec"] > 0)
        | (df["pub_rec_bankruptcies"] > 0)
        | (df["tax_liens"] > 0)
    ).astype(int)

    df["credit_history_years"] = df["total_acc"] / 3
    df["inquiry_density"] = df["inq_last_6mths"] / (df["credit_history_years"] + 1)

    df.drop(columns=["credit_history_years"], inplace=True)

    df["term_36"] = (df["term"] == "36 months").astype(int)
    df["term_60"] = (df["term"] == "60 months").astype(int)

    df["verification_NotVerified"] = (df["verification_status"] == "Not Verified").astype(int)
    df["verification_SourceVerified"] = (df["verification_status"] == "Source Verified").astype(int)
    df["verification_Verified"] = (df["verification_status"] == "Verified").astype(int)

    df["home_RENT"] = (df["home_ownership"] == "RENT").astype(int)
    df["home_MORTGAGE"] = (df["home_ownership"] == "MORTGAGE").astype(int)
    df["home_OWN"] = (df["home_ownership"] == "OWN").astype(int)

    for p in PURPOSE:
        key = p.replace("purpose_", "")
        df[p] = (df["purpose"] == key).astype(int)

    return df[VECTOR_COLUMNS].values[0].astype(float)
