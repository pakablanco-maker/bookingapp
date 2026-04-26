import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // Si l'expiration est passée, le token est invalide
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // Erreur de décodage = token invalide
  }
};

//save user token to local storage
export const saveUserToLocalStorage = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to local storage:', error);
  }
};

//clear user token from local storage
export const clearUserFromLocalStorage = () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error clearing user from local storage:', error);
  }
};


//get current user token from local storage
export const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    //securité contre null, undefined ou la chaine vide
    if(!user || user === "undefined") return null;
    return user;
  } catch (error) {
    console.error('Error getting user from local storage:', error);
    return null;
  }
};

// Récupération simplifiée
export const getTokenFromLocalStorage = () => {
 try {
  const user = getCurrentUser();
  return user ? user.token : null;
 } catch (error) {
  console.error('Error getting token from local storage:', error);
  return null;
 }
};