import { createContext,useState,useEffect ,useContext} from "react";
import axios from 'axios'
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const AppContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppProvider = ({children})=>{

    const [isAdmin, setisAdmin] = useState(false)
    const [favouriteMovies, setfavouriteMovies] = useState([])
    const [shows, setShows] = useState([])
    const [refreshKey, setRefreshKey] = useState(0)

    const {user} = useUser()
    const {getToken} = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const triggerRefresh = () => setRefreshKey(prev => prev + 1)

    const fetchIsAdmin = async() => {
        try{
           const {data} =  await axios.get('/api/admin/is-admin',{
            headers:{Authorization: `Bearer ${await getToken()}`}
           })

           setisAdmin(data.isAdmin)
           if(!data.isAdmin && location.pathname.startsWith('/admin')){
            navigate('/')
            toast.error('You are not an admin')
           }
            
        }
        catch(error){
            if(error.response?.status !== 401){
                console.error('fetchIsAdmin failed:', error)
            }
        }
    }

    const fetchShows = async() => {
        try{
           const {data} =  await axios.get('/api/shows/all')
           if(data.success){
            setShows(data.shows)
           }
           else{
            toast.error(data.message)
           }
        }
        catch(error){
            console.error('fetchShows failed:', error)
        }
    }

    const fetchFavouriteMovies = async() => {
        try{
           const {data} =  await axios.get('/api/user/favourites',{
            headers:{Authorization: `Bearer ${await getToken()}`}
           })
           if(data.success){
            setfavouriteMovies(data.movies)
           }
           else{
            toast.error(data.message)
           }
        }
        catch(error){
            if(error.response?.status !== 401){
                console.error('fetchFavourites failed:', error)
            }
        }
    }

    useEffect(()=>{
        fetchShows()
    },[refreshKey])

    useEffect(()=>{
        if(user){
            fetchIsAdmin()
            fetchFavouriteMovies()
        }
        
    },[user])

    const value = {axios,fetchIsAdmin,user,getToken,navigate,isAdmin,shows,favouriteMovies,fetchFavouriteMovies,triggerRefresh,refreshKey}
    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)

