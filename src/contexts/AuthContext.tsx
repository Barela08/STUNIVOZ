import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, onAuthStateChangedListener, getCollection, addDocument, updateDocument } from '../services/firebase';

// Local Profile type (Firebase)
interface Profile {
  id: string;
  email: string;
  full_name: string;
  profile_photo?: string;
  phone?:
