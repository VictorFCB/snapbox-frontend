import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Email from '../pages/Email';
import UrlParametrizer from '../pages/UrlParametrizer';
import Login from '../pages/Login';


function AppRoutes() {
    return (
                <Routes>
                    <Route path="/" element={<Login/>}/>
                    <Route path="/Home" element={<Home/>} />
                    <Route path="/Email" element={<Email />} />
                    <Route path="/UrlParametrizer" element={<UrlParametrizer />} />
                </Routes>
    );
}

export default AppRoutes;
