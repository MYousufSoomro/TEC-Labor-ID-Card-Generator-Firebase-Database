import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import {
  getDatabase,
  ref,
  set,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDSjin3dOcuJ4ayEESIy5IcRovf1d2mRU",
  authDomain: "tec-id-card.firebaseapp.com",
  projectId: "tec-id-card",
  storageBucket: "tec-id-card.appspot.com",
  messagingSenderId: "832400378679",
  appId: "1:832400378679:web:1c7951c2d6b79e8f8ca8b2",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();
const auth = getAuth();
var STORAGE = getStorage(app);

var alertOnLoad;
var img;
var userFound;
var mainForm = document.getElementById("mainForm");
var file = document.getElementById("file");
var cnic = document.getElementById("cnic");

var empArr = [];
const cnicRegExp = new RegExp(/\d{5}-\d{7}-\d/);

onAuthStateChanged(auth, (user) => {
  if (user) {
    validate(user);
  } else {
    ("user not signed in");
    signIn();
  }
});

function validate(user) {
  if (
    user.uid === "VJAAs6Dn22Z6ji8LoMs1qZiymr82" ||
    user.uid === "ZVjOhIjRdafBOPwxgQCegj2IFJ03"
  ) {
    document.getElementById("mainForm").style.display = "block";
    console.log("valid user signed in");
    alertOnLoad = Swal.close();
    return true;
  } else {
    Swal.fire({
      title: "ACCESS DENIED",
      text: "Not valid user found!",
      icon: "error",
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonText: "Re-Authenticate with Google",
    }).then((result) => {
      if (result.isConfirmed) {
        signInWithGoogleID();
      }
    });

    console.log("Not valid user found");
    return false;
  }
}

window.signInWithGoogleID = function () {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log(user.uid);
      validate(user);
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function signIn() {
  mainForm.style.display = "none";

  alertOnLoad = Swal.fire({
    title: "Sign In with Google",
    text: "Click below button to sign in!",
    icon: "warning",
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    confirmButtonText: "Authenticate with Google",
  }).then((result) => {
    if (result.isConfirmed) {
      signInWithGoogleID();
    }
  });
}

window.loadFile = function (event) {
  var image = document.getElementById("img");
  image.src = URL.createObjectURL(event.target.files[0]);
};

function getDataFromDatabase() {
  var reference = ref(database, `employees/${formatCNIC(cnic.value)}`);
  onChildAdded(reference, function (data) {
    empArr.push(data.val());
  });
}

function checkEmployeeIfExists() {
  if (empArr.length === 0) {
    return true;
  } else {
    for (var i = 0; i < empArr.length; i++) {
      if (formatCNIC(cnic.value) !== formatCNIC(empArr[i].cnic)) {
        return true;
      } else {
        var currentDate = new Date();
        var cardExpiry = new Date(empArr[i].expiry);

        if (currentDate < cardExpiry) {
          userFound = empArr[i];
          return false;
        } else {
          return true;
        }
      }
    }
  }
}

window.generateID = function () {
  var flag = checkEmployeeIfExists();

  // console.log(empArr);

  if (flag) {
    if (cnicRegExp.test(cnic.value)) {
      var userObj = {};

      var name = document.getElementById("name").value;
      var fname = document.getElementById("fname").value;
      var designation = document.getElementById("designation").value;
      var expiryDate = document.getElementById("expiry").value;
      var expiry_date = new Date(expiryDate);
      var expiry =
        expiry_date.getDate() +
        " " +
        monthNames[expiry_date.getMonth()] +
        ", " +
        expiry_date.getFullYear();

      if (
        name !== "" &&
        fname !== "" &&
        designation !== "" &&
        cnic.value !== "" &&
        expiry !== "" &&
        file.value !== ""
      ) {
        userObj.name = name;
        userObj.fname = fname;
        userObj.designation = designation;
        userObj.cnic = cnic.value;
        userObj.expiry = expiry;

        // console.log(userObj);

        document.getElementById("name2").innerHTML = name;
        document.getElementById("fname2").innerHTML = fname;
        document.getElementById("designation2").innerHTML = designation;
        document.getElementById("cnic2").innerHTML = cnic.value;
        document.getElementById("expiry2").innerHTML = expiry;

        document.getElementById("mainForm").style.display = "none";
        document.body.style.background = "white";
        document.getElementById("wrapper").style.display = "block";
        document.getElementById("upperWrapper").style.display = "block";

        const getScreenshotOfElement = async (element) => {
          var canvas = await html2canvas(element);

          img = canvas.toDataURL("image/png");
          // document.write(
          //   `<div>
          //       <img src="${img}" height="100%"/>
          //       <br />
          //       <a style="
          //         position: fixed;
          //         top: 10;
          //         right: 20;
          //         background-color: #4caf50;
          //         border: none;
          //         color: white;
          //         padding: 15px 32px;
          //         text-align: center;
          //         text-decoration: none;
          //         display: inline-block;
          //         font-size: 16px;
          //         margin-top: 10px;
          //         cursor: pointer;
          //         width: 30%;"
          //       href="${img}" download="TEC ID Card">Download Card</a>
          //   </div>`
          // );
        };
        const div = document.getElementById("wrapper");
        getScreenshotOfElement(div);
      } else {
        Swal.fire({
          icon: "error",
          title: "PLEASE ENTER ALL FIELDS",
          confirmButtonText: "Try Again!",
        });
      }

      var profileImageRef = storageRef(
        STORAGE,
        `images/${formatCNIC(userObj.cnic)}-profile.jpg`
      );
      var cardImageRef = storageRef(
        STORAGE,
        `images/${formatCNIC(userObj.cnic)}-card.jpg`
      );

      uploadBytes(profileImageRef, file.files[0])
        .then(function (success) {
          getDownloadURL(success.ref).then((downloadURL) => {
            userObj.empPicURL = downloadURL;

            getFileBlob(img, (blob) => {
              uploadBytes(cardImageRef, blob)
                .then(function (success) {
                  getDownloadURL(success.ref).then((downloadURL) => {
                    userObj.empCardURL = downloadURL;

                    var REFER = ref(
                      database,
                      `employees/${formatCNIC(userObj.cnic)}`
                    );
                    set(REFER, userObj)
                      .then(function (success) {
                        console.log(success);

                        document.write(
                          `<div>
                            <img src="${img}" height="100%"/>
                            <br />
                            <a style="
                              position: fixed;
                              top: 10;
                              right: 20;
                              background-color: #4caf50;
                              border: none;
                              color: white;
                              padding: 15px 32px;
                              text-align: center;
                              text-decoration: none;
                              display: inline-block;
                              font-size: 16px;
                              margin-top: 10px;
                              cursor: pointer;
                              width: 30%;" 
                            href="${img}" download="TEC ID Card">Download Card</a>
                            <a style="
                              position: fixed;
                              bottom: 10;
                              right: 20;
                              background-color: #0d6efd;
                              border: none;
                              color: white;
                              padding: 15px 32px;
                              text-align: center;
                              text-decoration: none;
                              display: inline-block;
                              font-size: 16px;
                              margin-top: 10px;
                              cursor: pointer;
                              width: 30%;" 
                            href="../index.html">Back to Dashboard</a>
                        </div>`
                        );
                      })
                      .catch(function (error) {
                        console.log(error);
                      });
                  });
                })
                .catch(function (err) {
                  console.error(err);
                });
            });
          });
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      // alert("Please enter correct CNIC format \nFor e.g: 42201-123456-7");
      Swal.fire({
        icon: "error",
        title: "CNIC Error",
        confirmButtonText: "Try Again!",
        html: "<p>Please enter correct CNIC format <br />For e.g: <strong>42201-123456-7</strong></p>",
      });
    }
  } else {
    console.log("User exists already...");
    console.log(userFound);

    Swal.fire({
      title: "Already Exists",
      text: "Employee already exists in database. Do you want to download Card?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, download!",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = userFound.empCardURL;
      }
    });
  }
};

function formatCNIC(id) {
  return id.split("-").join("");
}

var getFileBlob = function (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.addEventListener("load", function () {
    cb(xhr.response);
  });
  xhr.send();
};

window.onload = getDataFromDatabase();
