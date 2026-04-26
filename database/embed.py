from sentence_transformers import SentenceTransformer
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:12345678@localhost:5432/HireAble")
model = SentenceTransformer('all-MiniLM-L6-v2')

with engine.connect() as conn:
    rows = conn.execute(text("SELECT id, name FROM skills")).fetchall()
    
    for skill_id, skill_name in rows:
        embedding = model.encode(skill_name).tolist()
        conn.execute(
            text("UPDATE skills SET embedding = :embedding WHERE id = :id"),
            {"embedding": embedding, "id": skill_id}
        )
    
    conn.commit()
    print(f"Done. Embedded {len(rows)} skills.")