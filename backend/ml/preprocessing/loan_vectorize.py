import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import os

class LoanVectorizer:
    def __init__(self):
        # 1. Define Feature Groups
        self.numeric_features = [
            'loan_amnt', 'annual_inc', 'open_acc', 'total_acc', 'mort_acc',
            'delinq_2yrs', 'revol_bal', 'tot_cur_bal', 'avg_cur_bal',
            'acc_open_past_24mths', 'term_int', 'emp_length_int',
            'open_account_ratio', 'severe_credit_event', 'inquiry_density'
        ]
        self.categorical_features = ['purpose', 'verification_status', 'home_ownership']
        
        # 2. Build Pipeline
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', Pipeline([
                    ('imputer', SimpleImputer(strategy='median')),
                    ('scaler', StandardScaler())
                ]), self.numeric_features),
                
                ('cat', Pipeline([
                    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
                    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
                ]), self.categorical_features)
            ],
            verbose_feature_names_out=False
        )
        
        self.is_fitted = False

    def _engineer_features(self, df):
        """Internal method to clean and engineer features."""
        df_eng = df.copy()

        # --- A. Text Cleaning ---
        # 1. Term cleaning (Handle ' 36 months' vs numeric)
        if df_eng['term'].dtype == 'O':
            df_eng['term_int'] = df_eng['term'].astype(str).str.replace(' months', '', regex=False)
        else:
            df_eng['term_int'] = df_eng['term']

        # 2. Emp Length Mapping
        emp_map = {
            '< 1 year': 0, '1 year': 1, '2 years': 2, '3 years': 3, '4 years': 4,
            '5 years': 5, '6 years': 6, '7 years': 7, '8 years': 8, '9 years': 9,
            '10+ years': 10
        }
        # Force string conversion before mapping to handle mixed types
        if df_eng['emp_length'].dtype == 'O':
            df_eng['emp_length_int'] = df_eng['emp_length'].map(emp_map).fillna(0)
        else:
            df_eng['emp_length_int'] = df_eng['emp_length'].fillna(0)

        # --- B. Feature Creation ---
        # 3. Ratios
        # Force conversion to numeric before division to prevent errors
        o_acc = pd.to_numeric(df_eng['open_acc'], errors='coerce').fillna(0)
        t_acc = pd.to_numeric(df_eng['total_acc'], errors='coerce').fillna(0)
        
        # Handle division by zero safely
        df_eng['open_account_ratio'] = np.where(t_acc > 0, o_acc / t_acc, 0)

        # 4. Severe Credit Event
        severe_cols = ['pub_rec', 'pub_rec_bankruptcies', 'tax_liens']
        for c in severe_cols:
            if c not in df_eng.columns:
                df_eng[c] = 0
            df_eng[c] = pd.to_numeric(df_eng[c], errors='coerce').fillna(0)

        df_eng['severe_credit_event'] = (
            (df_eng['pub_rec'] > 0) | 
            (df_eng['pub_rec_bankruptcies'] > 0) | 
            (df_eng['tax_liens'] > 0)
        ).astype(int)

        # 5. Inquiry Density
        # Date parsing
        df_eng['earliest_cr_line_dt'] = pd.to_datetime(df_eng['earliest_cr_line'], format='%b-%Y', errors='coerce')
        
        if 'Application Date' in df_eng.columns:
             df_eng['app_date_dt'] = pd.to_datetime(df_eng['Application Date'], errors='coerce')
        else:
             df_eng['app_date_dt'] = pd.to_datetime("today")

        # Fallback for null dates
        df_eng['app_date_dt'] = df_eng['app_date_dt'].fillna(pd.Timestamp.now())

        # History Years
        df_eng['credit_history_years'] = (df_eng['app_date_dt'] - df_eng['earliest_cr_line_dt']).dt.days / 365.25
        df_eng['credit_history_years'] = df_eng['credit_history_years'].fillna(1)
        df_eng.loc[df_eng['credit_history_years'] <= 0, 'credit_history_years'] = 0.5
        
        # Inquiry Density Calculation
        inq_6m = pd.to_numeric(df_eng['inq_last_6mths'], errors='coerce').fillna(0)
        df_eng['inquiry_density'] = inq_6m / df_eng['credit_history_years']

        # --- C. SAFETY CAST (The Fix) ---
        # Strictly force all numeric features to float. 
        # Any "junk" strings become NaN, which the Median Imputer can then handle.
        for col in self.numeric_features:
            if col in df_eng.columns:
                df_eng[col] = pd.to_numeric(df_eng[col], errors='coerce')

        return df_eng

    def fit(self, df):
        """Learns the scaling and encoding parameters from Training Data."""
        valid_statuses = ['Fully Paid', 'Charged Off', 'Default']
        df_clean = df[df['loan_status'].isin(valid_statuses)].copy()
        
        df_eng = self._engineer_features(df_clean)
        
        self.preprocessor.fit(df_eng)
        self.is_fitted = True
        print("✅ Vectorizer fitted successfully.")

    def transform(self, df):
        """Transforms data into vectors using the fitted parameters."""
        if not self.is_fitted:
            raise Exception("Vectorizer not fitted! Call fit() or load() first.")

        # Logic to handle X and Y alignment
        if 'loan_status' in df.columns:
            valid_statuses = ['Fully Paid', 'Charged Off', 'Default']
            df_clean = df[df['loan_status'].isin(valid_statuses)].copy()
            
            target_map = {'Fully Paid': 0, 'Charged Off': 1, 'Default': 1}
            Y = df_clean['loan_status'].map(target_map)
        else:
            df_clean = df.copy()
            Y = None

        df_eng = self._engineer_features(df_clean)
        vectors = self.preprocessor.transform(df_eng)
        
        X_df = pd.DataFrame(vectors, columns=self.preprocessor.get_feature_names_out(), index=df_clean.index)
        
        return X_df, Y

    def save(self, filepath=None):
        base_dir = os.path.dirname(os.path.abspath(__file__))

        if filepath is None:
            filepath = os.path.join(base_dir, "vectorizer.joblib")

        joblib.dump(self, filepath)
        print(f"💾 Vectorizer saved to {filepath}")


    @staticmethod
    def load(filepath="vectorizer.joblib"):
        return joblib.load(filepath)