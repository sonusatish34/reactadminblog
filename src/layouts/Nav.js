import React from "react";
import { Link } from "react-router-dom";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AdminName } from "../Api/Api";
function Nav(){
return(
    <nav className="border bg-white p-4 flex justify-between items-center">
        <Link to="/Admin/">
            <div className="">Blog Admin</div>
        </Link>
        <div className="flex items-center space-x-4">
            <div className="flex">
                    <p>{localStorage.getItem('AdminName')}</p>
                <p type="text" placeholder="Admin name" className="bg-white p-2 rounded" ><AdminName/></p>
                <p className="bg-white p-2 rounded hover:cursor-pointer">
                </p>
            </div>
        </div>
    </nav>

);
}
export default Nav;