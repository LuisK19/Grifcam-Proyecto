import { createContext, useContext, useState } from 'react'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([])
  // Cada item: { id, name, price, previous_price, image_url, cantidad }

  // Agregar producto - si ya existe, suma la cantidad
  function agregar(producto, cantidad = 1) {
    setItems(prev => {
      const existe = prev.find(i => i.id === producto.id)
      if (existe) {
        return prev.map(i =>
          i.id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        )
      }

      // Obtener primera imagen desde product_images[] o fallback a image_url
      const imgUrl = producto.product_images?.length > 0
        ? [...producto.product_images]
            .sort((a, b) => a.image_order - b.image_order)[0].image_url
        : (producto.image_url ?? null)

      return [...prev, {
        id:             producto.id,
        name:           producto.name,
        price:          Number(producto.price),
        previous_price: producto.previous_price ? Number(producto.previous_price) : null,
        image_url:      imgUrl,
        cantidad,
      }]
    })
  }

  function setCantidad(id, cantidad) {
    if (cantidad < 1) return
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, cantidad } : i)
    )
  }

  function eliminar(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function vaciar() {
    setItems([])
  }

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)
  const totalMonto = items.reduce((acc, i) => acc + i.price * i.cantidad, 0)

  return (
    <CarritoContext.Provider value={{
      items,
      agregar,
      setCantidad,
      eliminar,
      vaciar,
      totalItems,
      totalMonto,
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  return ctx
}