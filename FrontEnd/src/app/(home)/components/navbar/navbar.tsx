import { FaSearch } from 'react-icons/fa';
import NavbarMD from './props/md-size';
import MainIcon from './props/main-icon';
import AuthButton from './props/auth-button';

export default function Navbar() {
  return (
    <nav className="flex z-50 bg-emerald-700 h-15 w-full text-gray-200 
                    items-center justify-between px-8 font-bold">

      <MainIcon />

      <div className="hidden md:flex items-center border border-emerald-600 
                      rounded-md overflow-hidden mx-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Search"
          className="bg-emerald-800 text-white px-3 py-1 w-full focus:outline-none 
                     focus:bg-white focus:text-black"
        />
        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
          <FaSearch />
        </button>
      </div>

      <AuthButton />
      
      <NavbarMD />
    </nav>  
  )
}