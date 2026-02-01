# KNL Smoothing: Context-Aware Credit Decision Memory for Emerging Markets

**Qdrant Vector Database Hackathon 2026 | Use Case 3: Credit Decision Memory**

A full-stack machine learning web application for credit decision analysis powered by vector similarity search. The platform combines a modern web interface built with Next.js and a Python backend powered by FastAPI. It ingests loan application data, performs fraud detection, retrieves similar historical cases from Qdrant, augments features with neighbor statistics, trains ensemble machine learning models, and exposes prediction APIs consumed by the frontend. The goal is to provide an end-to-end pipeline from loan applications to risk predictions with explainable precedent-based reasoning through a production-ready architecture.

---

## 🎯 The Problem

In emerging markets:

- No centralized credit bureaus
- Credit decisions evaluated in isolation
- First-time borrowers face automatic rejection
- Lack of transparent explanations
- High default and rejection rates

---

## 💡 Our Solution

**KNN Smoothing** replaces isolated credit evaluation with vector-based decision memory:

- Store historical loan decisions as vectors in Qdrant
- Retrieve K-nearest similar cases for new applications
- Augment features with neighbor statistics
- Predict using ensemble models trained on augmented features
- Explain decisions through institutional precedent

---

## 📊 Results

| Model | Baseline (42 features) | With Neighbors (54 features) | Lift |
|-------|-----------------------|-----------------------------|------|
| Logistic Regression | 68% AUC | 71% AUC | +3% |
| LightGBM | 73% AUC | 76% AUC | +3% |
| First-Time Borrowers | 65% AUC | 72% AUC | +7% |

---

## 🛠️ Tech Stack

**Frontend:**

- Next.js, React, TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**

- Python, FastAPI
- Pandas, NumPy, Scikit-Learn, LightGBM
- SHAP, LangChain, Groq

**Vector Database:**

- Qdrant

---

## 🏗️ Architecture Overview

The system follows a **full-stack + ML + vector search architecture**.  

**High-level flow:**


---

## 🔬 Machine Learning Pipeline

1. **Data Ingestion** - LendingClub loan dataset  
2. **Missing Value Detection** - Identify data gaps  
3. **Data Cleaning** - Tunisia feature filtering (remove US credit bureau variables)  
4. **Feature Engineering** - 42 Tunisia-compatible features  
5. **Fraud Detection** - Isolation Forest + Robust Ratio Z-Scores  
6. **Qdrant Retrieval** - K=5, 20, 50 neighbor queries  
7. **Feature Augmentation** - Compute 12 neighbor statistics  
8. **Model Training** - Logistic Regression and LightGBM on 54 features  
9. **Model Persistence** - Save trained models  
10. **Model Serving** - Real-time prediction API  

> Both models are compared, and ensemble weighting is determined by validation set performance.

<img width="1263" height="384" alt="image" src="https://github.com/user-attachments/assets/38919543-7337-4968-b260-1975f0671b7a" />

<img width="1276" height="382" alt="image" src="https://github.com/user-attachments/assets/fd7ad1cd-44ba-4c83-8d1c-dfc083ca61e5" />



---

## 📁 Project Structure

