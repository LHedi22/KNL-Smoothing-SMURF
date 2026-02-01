import os
import base64
from typing import Any, Dict, Optional
import qdrant_client
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, Filter, FieldCondition, MatchValue
from core.config import settings

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            url=os.getenv("QDRANT_URL", settings.QDRANT_URL),
            api_key=os.getenv("QDRANT_API_KEY", settings.QDRANT_API_KEY)
        )

    def upsert_model_artifact(self, version: str, model_type: str, binary: bytes, metadata: Dict[str, Any]):
        collection = "model_artifacts"
        payload = metadata.copy()
        payload["version"] = version
        payload["model_type"] = model_type
        payload["binary"] = base64.b64encode(binary).decode()
        self.client.upsert(
            collection_name=collection,
            points=[PointStruct(
                id=f"{version}_{model_type}",
                vector=[0.0],
                payload=payload
            )]
        )

    def get_model_artifact(self, version: str, model_type: str) -> Optional[Dict[str, Any]]:
        collection = "model_artifacts"
        result = self.client.scroll(
            collection_name=collection,
            scroll_filter=Filter(
                must=[
                    FieldCondition(key="version", match=MatchValue(value=version)),
                    FieldCondition(key="model_type", match=MatchValue(value=model_type))
                ]
            ),
            limit=1
        )
        if result and result[0]:
            payload = result[0][0].payload
            payload["binary"] = base64.b64decode(payload["binary"])
            return payload
        return None

    def upsert_metadata(self, version: str, metadata: Dict[str, Any]):
        collection = "model_metadata"
        payload = metadata.copy()
        payload["version"] = version
        self.client.upsert(
            collection_name=collection,
            points=[PointStruct(
                id=version,
                vector=[0.0],
                payload=payload
            )]
        )

    def get_metadata(self, version: str) -> Optional[Dict[str, Any]]:
        collection = "model_metadata"
        result = self.client.scroll(
            collection_name=collection,
            scroll_filter=Filter(
                must=[FieldCondition(key="version", match=MatchValue(value=version))]
            ),
            limit=1
        )
        if result and result[0]:
            return result[0][0].payload
        return None

    def list_versions(self):
        collection = "model_metadata"
        result = self.client.scroll(collection_name=collection, limit=100)
        return [p.payload for p in result[0]] if result and result[0] else []
