const express = require('express');
const app = express();
const port = 3000;
const firebase = require('firebase');
const bodyparser = require('body-parser');
// Import Admin SDK
const admin = require("firebase-admin");
var serviceAccount = require("./public/angelhack-caa31-firebase-adminsdk-8rc7q-9d5b750774.json");
admin.initializeApp({

    credential: admin.credential.cert(serviceAccount),
    databaseURL: "비밀",
});

const firebaseConfig = {
    apiKey: "비밀",
    authDomain: "비밀",
    databaseURL: "비밀",
    projectId: "비밀",
    storageBucket: "비밀",
    messagingSenderId: "비밀",
    appId: "비밀",
    measurementId: "비밀"
};

firebase.initializeApp(firebaseConfig);

// Get the Auth service for the default app
var authService = firebase.auth();

let db = admin.firestore();
//var db = admin.database();
//var ref = db.ref("/");


app.set('views', './views')
app.set('view engine', 'pug')
app.locals.pretty = true;

// 데이터 입력
function writeUserData(userId, name, phone, usertype) {
    // var usersRef = ref.child("users");
    // usersRef.set({
    //     userId:{
    //         username: name,
    //         phone: phone,
    //         usertype : usertype
    //     }
    // });

    let docRef = db.collection('users').doc('alovelace');

    let setAda = docRef.set({
        username: name,
        phone: phone,
        usertype : usertype
    });
}


app.use(bodyparser.urlencoded({
    exrended: false
}))

app.use(express.static(__dirname + "/public"));


app.get('/main', (req, res)=>{
    res.render('index');
})

app.get('/MyPage', (req,res)=>{
    res.render('MyPage');
})

app.get('/Login', (req, res)=>{
    //데이터 가져오기
    db.collection('users').get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
        });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });

    res.render('Login');
})

app.get('/SignUp', (req, res)=>{
    res.render('SignUp');
});


app.post('/SignUp', (req, res)=>{
    const username = req.body.Name;
    const userpassword = req.body.userPassword;
    const useremail = req.body.userEmail;
    const user_type = req.body.user_type;
    const user_phone = req.body.userPhoneNumber;
    var usertype;
    authService.createUserWithEmailAndPassword(useremail, userpassword).
    then(function() {
        if( user_type[0].checked) usertype = "일반 유저";
        else usertype = "소상공인"

        let docRef = db.collection('users').doc('alovelace');

        let setAda = docRef.set({
            username: username,
            phone: user_phone,
            usertype : usertype
        });

        console.log('회원가입 성공');
        res.redirect('index');
    })
    .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('errorCode = ' + errorCode);
        console.log('errorMessage = ' + errorMessage);

        if(errorCode=="auth/weak-password")
        {
            res.send(`<script type="text/javascript">alert("비밀번호는 6글자 이상으로 작성해주세요.");location.href="/SignUp";</script>`);
        }

        else if(errorCode == "auth/email-already-in-use")
        {
            res.send(`<script type="text/javascript">alert("사용중인 이메일입니다.");location.href="/SignUp";</script>`);
        }
    });

});

app.post('/Login', (req,res)=>{
    const useremail = req.body.userEmail;
    const userpassword = req.body.PW;

    authService.signInWithEmailAndPassword(useremail, userpassword).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log('errorCode = ' + errorCode);
            console.log('errorMessage = ' + errorMessage);
            
            //비밀번호 틀림
            if(errorCode == "auth/wrong-password")
            {
                res.send(`<script type="text/javascript">alert("비밀번호가 잘못되었습니다");
                location.href="/Login";</script>`);
            }
            else if(errorCode == "auth/user-not-found")
            {
                res.redirect(`<script type="text/javascript">alert("사용중인 이메일입니다");
                location.href="/Login";</script>`);
            }
    });

    
    authService.onAuthStateChanged(function(user) {
        if (user) {
            
            console.log('로그인 됨' + JSON.stringify(user));
        } 
        else {
            console.log('로그인 안됨');
        }
    });
})

app.listen(port, (req, res)=>{
    console.log('Server Connected');
})