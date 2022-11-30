import { createContext, ReactNode, useContext, useState } from "react";
import { ShoppingCart } from "../components/ShoppingCart";
import { useLocalStorage } from "../hooks/useLocalStorage";

//ReactNode is the type of the children property inside react
type ShoppingCartProviderProps = {
    children: ReactNode
}

type CartItem ={
    id: number
    quantity: number
}

type ShoppingCartContext = {
    openCart: () => void
    closeCart: () => void
    cartQuantity: number
    cartItems: CartItem[]
    getItemQuantity: (id: number) => number
    increaseItemQuantity: (id: number) => void
    decreaseItemQuantity: (id: number) => void
    removeFromCart: (id: number) => void
}

const ShoppingCartContext = createContext({} as ShoppingCartContext)
//function for getting our context
export function useShoppingCart() {
    return useContext(ShoppingCartContext)
}

//Provider portion, code for rendering shopping cart (all values we need)
export function ShoppingCartProvider( {children}:
     ShoppingCartProviderProps) {
        const [isOpen, setIsOpen] = useState(false)
        const [cartItems, setCartItems] = useLocalStorage<CartItem[]>("shopping-cart", [])
//count every item quantity in the cart, star at zero
        const cartQuantity = cartItems.reduce(
            (quantity, item) => item.quantity + quantity,
            0
            )
        
        const openCart = () => setIsOpen(true)
        const closeCart = () => setIsOpen(false)
    

        function getItemQuantity(id: number) {
            //find item with current id, if available return quantity,otherwise return 0
            return cartItems.find(item => item.id === id)?.quantity || 0
        }
        function increaseItemQuantity(id: number) {
            //if we can find an item inside the cart, increment quantity.
            setCartItems(currItems => {
                if (currItems.find(item => item.id === id) == null) {
                    return [...currItems, { id, quantity: 1}]
                } else {
                    return currItems.map(item => {
                        if (item.id === id) {
                            return {...item, quantity: item.quantity + 1}
                            //otherwise return item as is
                        } else {
                            return item
                        }
                    })
                }
            })
        }
        function decreaseItemQuantity(id: number) {
            setCartItems(currItems => {
                //if quantity of item is 1, remove item
                if (currItems.find(item => item.id === id)?.quantity === 1) {
                    return currItems.filter(item => item.id !== id)
                } else {
                    return currItems.map(item => {
                        if (item.id === id) {
                            return {...item, quantity: item.quantity - 1}
                        } else {
                            return item
                        }
                    })
                }
            })
        }
        function removeFromCart(id: number) {
            setCartItems(currItems => {
                return currItems.filter(item => item.id !== id)
            })
        }

    return (
        <ShoppingCartContext.Provider value={{
            getItemQuantity,
            increaseItemQuantity,
            decreaseItemQuantity,
            removeFromCart,
            cartItems,
            cartQuantity,
            openCart,
            closeCart}}>
            {children}
            <ShoppingCart isOpen={isOpen} />
        </ShoppingCartContext.Provider>
    )
}