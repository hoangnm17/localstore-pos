import { useEffect, useState, useRef } from "react"
import { customersSearch } from "../../services/Customer/customer.service"

export function useCustomerSearch(phone) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const activeRequest = useRef(0)

  useEffect(() => {
    if (!phone || phone.length < 6) {
      setResult(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const requestId = ++activeRequest.current

    const timer = setTimeout(async () => {
      try {
        const res = await customersSearch(phone)
        
        if (requestId === activeRequest.current) {
          setResult(res?.data?.data || null)
        }
      } catch (error) {
        console.error("Search customer error:", error)
      } finally {
        if (requestId === activeRequest.current) {
          setLoading(false)
        }
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [phone])

  return { result, loading }
}