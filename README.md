# NutriAI 🥗

An AI-powered nutrition and meal subscription app. NutriAI calculates your daily nutrition needs, recommends meals, and includes an AI coach that can manage your plan through chat.

## Features

- Onboarding flow that collects your profile and goals
- Personalised calorie and nutrition calculation
- AI coach powered by Groq (supports function calling, e.g. cancel or upgrade a subscription)
- Meal recommendations using a meal dataset and an ML model
- Subscription plans with Razorpay payments
- Delivery partner integration

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Django, SQLite 
- **AI:** Groq API
- **Payments:** Razorpay
- **ML:** Logistic Regression, Naive-Bayes, Decision Trees algorithms

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Spoorthi256/NutriAI.git
cd NutriAI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env` and add your own keys:
```
VITE_GROQ_API_KEY=your-groq-api-key
```
Get a free key from [console.groq.com](https://console.groq.com).

### 4. Run the frontend
```bash
npm run dev
```

### 5. Run the backend 
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

## Project Structure

```
NutriAI/
├── src/ # React frontend (components, services, utils, types)
├── backend/ # Django backend
├── ml/ # Machine learning code
├── public/ # Static assets
└── MEAL_DATASET.csv
```

## Future Improvements

- Move API calls to the backend for better key security
- Add more cuisines and dietary preferences
- Mobile app version

## Author

**Spoorthi Rao**
GitHub: [@Spoorthi256](https://github.com/Spoorthi256)
