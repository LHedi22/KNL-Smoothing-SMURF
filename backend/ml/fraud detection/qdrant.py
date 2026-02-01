from qdrant_client import QdrantClient
from qdrant_client.http.models import SearchRequest

QDRANT_URL = "https://188e9235-2f68-485d-a951-05f8c16fe3bf.europe-west3-0.gcp.cloud.qdrant.io"
QDRANT_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.5pPotGXmDwJi_nUxC-MSDRVC6kdA_vsHjHXErpwPfO4"
client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    timeout=60
)


def scroll_collection(collection_name, limit=200, offset=None, with_vectors=True):

    points, next_offset = client.scroll(
        collection_name=collection_name,
        limit=limit,
        offset=offset,
        with_vectors=with_vectors,
        with_payload=False
    )

    return points, next_offset