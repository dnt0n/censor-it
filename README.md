# CensorIt - Team HackerStreet Boys (Tiktok TechJam 2025)

A cross-platform application that helps users protect their **Personally Identifiable Information (PII)** before sending prompts to cloud-based Large Language Models (LLMs).  
Built with **React Native (Expo)** on the frontend and **FastAPI + Hugging Face Spaces** on the backend, our app detects and censors sensitive information such as **names, addresses, postal codes, phone numbers, and NRICs**, tailored specifically for Singaporean users.

---

## 🚀 Problem Statement
**Track 7: Privacy Meets AI – Building a Safer Digital Future**  

As AI technologies rapidly integrate into our daily lives, concerns about privacy and security have become more urgent than ever. With the rise of powerful generative AI models, large-scale data collection, and cloud-based deployment, users face increasing risks: sensitive data leakage, identity theft, and misuse of personal information.

---

## 💡 Our Solution
CensorIt empowers users to **retain control over their personal data** by:
- Highlighting **PII** in user input.
- Allowing users to **censor or replace sensitive data** before sending text to LLM services.
- Ensuring safer interactions with AI tools without compromising convenience.

At its core, the system fine-tunes **DistilBERT** to recognize Singapore-specific PII using **synthetic training datasets** (5,000 examples for training and evaluation).

---

## 📹 Project Demo
▶️ **Video Demo** – [Censor It Demo](#) *(link to be added)*  

Frontend: [Expo Build](https://expo.dev/accounts/dant0n/projects/censor-it/builds/adfc7a57-3b9f-4da6-beda-7ceb2324c1da)  
Backend: [FastAPI (Hugging Face Spaces)](https://jovanteooo-hackstreetboys-techjam.hf.space/docs)  

---

## 🛠️ How We Built It
- **Model:** Fine-tuned **DistilBERT** with synthetic PII datasets tailored for Singapore.
- **Backend:** Deployed via **FastAPI** on Hugging Face Spaces.
- **Frontend:** Built with **React Native + Expo**, connected to the backend via API calls.
- **Training:** Dummy datasets generated using **Faker** and regex rules in **Google Colab**.

---

## 🔑 Features
1. **Input Box** – Users type or paste text for scanning.  
2. **PII Detection** – Detects and highlights PII with one click.  
3. **Interactive Output Box** – Tap highlighted items to replace them with placeholders (e.g., `James Tan → [Name]`).  
4. **Censored Output Box** – Displays a clean, safe version in real-time.  
5. **Copy Button** – Quickly copy censored text for safe usage in LLMs.  

---

## ⚡ Challenges Faced
- **Data Scarcity** – Couldn’t use real PII, so we created realistic synthetic datasets.  
- **Deployment Issues** – Heroku slug size limits forced us to shift to Hugging Face Spaces.  
- **Token Handling** – DistilBERT subword tokenization required regrouping tokens for frontend highlighting.  

---

## 📲 Deployment Instructions (APK)
1. **Download the APK** – [Download Here](https://expo.dev/accounts/dant0n/projects/censor-it/builds/adfc7a57-3b9f-4da6-beda-7ceb2324c1da)  
2. **Open the file** (via browser or Files → Downloads).  
3. **Allow installs from unknown sources** (Settings → Allow from this source).  
4. **Install & Open** – Tap *Install*, then *Open*.  

---

## 📂 Repository & Resources
- **Frontend & Backend Code:** [GitHub Repo](https://github.com/dnt0n/censor-it)  
- **Fine-tuned Model:** [Hugging Face Model](https://huggingface.co/kailermai03/techJamPII)  
- **Backend Hosting:** [Hugging Face Spaces](https://huggingface.co/spaces/JovanTeooo/HackStreetBoys-TechJam)  
- **Colab Notebook:** [Fine-tuning DistilBERT](https://colab.research.google.com/drive/1YmKhg52D8Lg0sQ0klV5JVEHPvnuvTZhw?usp=sharing)  

---

## 🏗️ Tech Stack
**Frontend**
- React Native (Expo)  
- React Navigation, Expo Go  
- FastAPI integration  

**Backend**
- Python + FastAPI  
- Uvicorn, Torch, Transformers  

**Machine Learning**
- PyTorch + Hugging Face Transformers  
- DistilBERT (fine-tuned for Singapore PII)  
- Faker, Regex, Random  

**Other Tools**
- Google Colab – Training environment  
- Hugging Face Spaces – Backend hosting  
- GitHub – Collaboration & version control  

---

## ✨ Inspiration
With the growing use of generative AI, users often share sensitive personal information without realizing it. CensorIt ensures **safe, controlled interactions** with AI systems, empowering users to decide what personal information they share.

---

## 👨‍💻 Team
HackStreetBoys – Tiktok TechJam 2025 Project  

---
