import { useEffect, useState } from "react"
import { customersSearch } from "../services/Customer/customer.service"

export function useCustomerSearch(phone) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Chưa nhập → reset
    if (!phone) {
      setCustomer(null)
      setLoading(false)
      return
    }

    // Chưa đủ số → không search
    if (phone.length < 6) {
      setCustomer(null)
      setLoading(false)
      return
    }

    setLoading(true)

    // Debounce 1s
    const timer = setTimeout(async () => {
      try {

        const data = await customersSearch(phone)

        // giả sử BE trả về mảng
        setCustomer(data?.[0] || null)
      } catch (error) {
        console.error("Search customer error:", error)
        setCustomer(null)
      } finally {
        setLoading(false)
      }
    }, 1000)

    // Cleanup
    return () => clearTimeout(timer)
  }, [phone])

  return { customer, loading, setCustomer }
}
