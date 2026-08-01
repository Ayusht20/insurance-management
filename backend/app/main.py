from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Insurance Management Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server, update for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, customers, policies, premiums, claims, documents, reports, plans , employees
app.include_router(plans.router)

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(policies.router)
app.include_router(premiums.router)
app.include_router(claims.router)
app.include_router(documents.router)
app.include_router(reports.router)
app.include_router(employees.router)
@app.get("/health")
def health_check():
    return {"status": "ok"}
@app.get("/")
def health_check():
    return {"status": "ok"}