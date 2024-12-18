import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  startAt,
  endAt,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { REGEX } from './constants';
import { messageContext } from '../components/AppContextHolder';

export const formValidatorRules = {
  required: {
    required: true,
    message: 'Required',
  },
  email: () => ({
    validator(rule, value) {
      if (!value) {
        return Promise?.resolve();
      }
      if (!REGEX?.EMAIL?.test(value)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise?.reject('The input is not valid E-mail!');
      }
      return Promise?.resolve();
    },
  }),
  name: () => ({
    validator(rule, value) {
      if (!value) {
        return Promise?.resolve();
      }
      if (!REGEX?.NAME?.test(value)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise?.reject('Please enter valid name');
      }
      return Promise?.resolve();
    },
  }),
  number: () => ({
    validator(rule, value) {
      if (!value) {
        return Promise?.resolve();
      }
      if (!Number(value) || !REGEX?.NUMBER?.test(Number(value))) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise?.reject('Should be a valid Number');
      }
      return Promise?.resolve();
    },
  }),
};

export const handleProtectedNavigation = (allow, callback, path) =>
  allow ? callback(path) : false;

export const createUserEmailPass = async (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = async (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => auth.signOut();

// sendPasswordResetEmail takes 3rd parameter that takes object { url :''} which used default firebase reset password page, after successful of change password there is one button with the mentioned url that will redirect back to that url. if you don't pass the url then there is no button with the url & only messgae that password reset successfully.
export const forgotPassword = (email) => sendPasswordResetEmail(auth, email);

export const resetPassword = (oobCode, newPassword) =>
  confirmPasswordReset(auth, oobCode, newPassword);

export const setDocTOFireStore = (collectionName, uid, schemaToFireStore) =>
  setDoc(doc(db, collectionName, uid), schemaToFireStore);

export const getDocFromStore = (collectionName, uid) =>
  doc(db, collectionName, uid);

export const deleteDocument = async (collectionName, uid) => {
  const docRef = doc(db, collectionName, uid);
  await deleteDoc(docRef);
};

export const updateRecord = async (collectionName, id, data) => {
  const docRef = doc(db, collectionName, id); // Reference to the document
  await updateDoc(docRef, data);
};

export const getAllDocsFromStore = async (collectionName, options = {}) => {
  const { filters = [], order = [], pagination = {}, search = {} } = options;

  // Reference to the Firestore collection
  let queryRef = collection(db, collectionName);

  // Apply additional filters
  filters.forEach(({ field, operator, value }) => {
    queryRef = query(queryRef, where(field, operator, value));
  });

  // Apply sorting
  order.forEach(({ field, direction }) => {
    queryRef = query(queryRef, orderBy(field, direction));
  });

  // Apply search filters specifically for email
  if (search?.field === 'email' && search?.value) {
    // Add orderBy for email if not already sorted
    const isEmailOrdered = order?.some(
      (orderItem) => orderItem?.field === 'email',
    );

    if (!isEmailOrdered) {
      queryRef = query(queryRef, orderBy('email'));
    }

    // Perform prefix matching for email
    queryRef = query(
      queryRef,
      startAt(search?.value?.toLowerCase()),
      endAt(`${search?.value?.toLowerCase()}\uf8ff`),
    );
  }

  // Create a separate query for counting, without pagination
  const countQueryRef = queryRef;

  // Apply pagination to the main query for fetching data
  if (pagination?.pageSize) {
    queryRef = query(queryRef, limit(pagination?.pageSize));
  }
  if (pagination?.lastVisible) {
    queryRef = query(queryRef, startAfter(pagination?.lastVisible));
  }

  // Fetch documents
  const querySnapshot = await getDocs(queryRef);

  // Get total count after applying filters and search (no pagination applied here)
  const dataFromServer = await getCountFromServer(countQueryRef);
  const totalCount = dataFromServer.data().count || 0;

  // Determine last visible document (for pagination)
  const lastVisible =
    querySnapshot?.docs?.length > 0
      ? querySnapshot.docs[querySnapshot.docs.length - 1]
      : null;

  // Map data
  const data = querySnapshot.docs.map((singleDoc) => ({
    id: singleDoc.id,
    ...singleDoc.data(),
  }));

  return { data, totalCount, lastVisible };
};

export const exportDataAsCSV = async (collectionName, fieldOrder) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const rawData = querySnapshot.docs.map((singleDoc) => ({
    id: singleDoc?.id,
    ...singleDoc?.data(),
  }));

  if (rawData.length === 0) {
    messageContext.info('No data found to export.');
    return;
  }

  const normalizedData = rawData.map((rowDataDoc) => {
    const orderedDoc = {};
    fieldOrder.forEach((field) => {
      orderedDoc[field] = rowDataDoc[field] || '';
    });
    return orderedDoc;
  });

  const headers = fieldOrder.join(',');
  const rows = normalizedData
    .map((formatedSingleDoc) =>
      fieldOrder
        .map((field) => {
          const value = formatedSingleDoc[field];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        })
        .join(','),
    )
    .join('\n');

  const csvContent = `${headers}\n${rows}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // eslint-disable-next-line no-undef
  const a = document.createElement('a');
  a.href = url;
  a.download = `${collectionName}.csv`;
  a.click();

  URL.revokeObjectURL(url);
};
