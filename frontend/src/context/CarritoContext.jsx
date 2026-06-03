import { createContext, useContext, useState } from 'react'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([])
  // Cada item: { id, name, price, image_url, cantidad }

  // Agregar producto — si ya existe, suma la cantidad
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
      return [...prev, {
        id:        producto.id,
        name:      producto.name,
        price:     producto.price,
        image_url: producto.image_url ?? null,
        cantidad,
      }]
    })
  }

  // Cambiar cantidad exacta (mínimo 1)
  function setCantidad(id, cantidad) {
    if (cantidad < 1) return
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, cantidad } : i)
    )
  }

  // Eliminar producto
  function eliminar(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // Vaciar carrito
  function vaciar() {
    setItems([])
  }

  // Total de ítems (suma de cantidades)
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  // Monto total
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
