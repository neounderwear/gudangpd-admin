import { useState, useEffect, useRef } from 'react'
import { db } from '@/firebase'
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  onSnapshot,
  where,
  type Query,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'

const PAGE_SIZE = 10

interface QueryState {
  docs: DocumentData[]
  loading: boolean
  error: Error | null
  hasMore: boolean
}

export function useFirestoreQuery<T extends DocumentData>(
  collectionPath: string,
  searchField: string,
  searchTerm: string,
) {
  const [state, setState] = useState<QueryState>({
    docs: [],
    loading: true,
    error: null,
    hasMore: false,
  })

  const [page, setPage] = useState(0)
  const pageCache = useRef<{
    [key: number]: {
      first: DocumentSnapshot | null
      last: DocumentSnapshot | null
    }
  }>({})

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true }))

    let q: Query = collection(db, collectionPath)

    if (searchTerm) {
      q = query(
        q,
        where(searchField, '>=', searchTerm),
        where(searchField, '<=', searchTerm + '\uf8ff'),
      )
    }

    q = query(q, orderBy(searchField))

    if (page > 0 && pageCache.current[page - 1]?.last) {
      q = query(q, startAfter(pageCache.current[page - 1].last))
    }

    q = query(q, limit(PAGE_SIZE + 1))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        const hasMore = newDocs.length > PAGE_SIZE
        if (hasMore) {
          newDocs.pop()
        }

        const firstVisible = snapshot.docs[0] || null
        const lastVisible =
          newDocs.length > 0 ? snapshot.docs[newDocs.length - 1] : null

        pageCache.current[page] = { first: firstVisible, last: lastVisible }

        setState({ docs: newDocs, loading: false, error: null, hasMore })
      },
      (err) => {
        console.error(err)
        setState({ docs: [], loading: false, error: err, hasMore: false })
      },
    )

    return () => unsubscribe()
  }, [collectionPath, searchField, searchTerm, page])

  const nextPage = () => {
    if (state.hasMore) {
      setPage((p) => p + 1)
    }
  }

  const prevPage = () => {
    if (page > 0) {
      setPage((p) => p - 1)
    }
  }

  return { ...state, data: state.docs as T[], nextPage, prevPage, page }
}
