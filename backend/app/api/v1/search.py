"""
Search API router — GET /api/v1/search
Full implementation in task 12.1.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/search", tags=["search"])
