const express = require('express');
const app = express();
const port = 3000;
const firebase = require('firebase');
const bodyparser = require('body-parser');
const admin = require("firebase-admin");
var serviceAccount = require("./public/angelhack-caa31-firebase-adminsdk-8rc7q-9d5b750774.json");
admin.initializeApp({

    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://angelhack-caa31.firebaseio.com",
});

const firebaseConfig = {
    apiKey: "AIzaSyCjUruu720ex7l6OBOgGBRyCtiOwl97KYo",
    authDomain: "angelhack-caa31.firebaseapp.com",
    databaseURL: "https://angelhack-caa31.firebaseio.com",
    projectId: "angelhack-caa31",
    storageBucket: "angelhack-caa31.appspot.com",
    messagingSenderId: "118901261199",
    appId: "1:118901261199:web:fcdcc4647bbfcd5bebc1fa",
    measurementId: "G-BGEFBC0Y7M"
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

app.use(bodyparser.urlencoded({
    exrended: false
}))

app.use(express.static(__dirname + "/public"));

// 데이터 입력
function writeUserData(userId, name, phone, usertype) {
    let docRef = db.collection('users').doc('alovelace');

    let setAda = docRef.set({
        username: name,
        phone: phone,
        usertype : usertype
    });
}

function writeBoard(challenge, title, content, writtername) {
    //firebase id값 설정 및 날짜 계산
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    var firebaseid = ''+writtername+yyyy+mm+dd+hours+minutes+seconds;

    if(dd < 10) {
        dd='0'+dd
    } 
    if(mm < 10) {
        mm='0'+mm
    }
    today = yyyy+'-' + mm+'-'+dd;
    
    //firebase 마지막 index값 가져오기
    var index = 1;
    db.collection('board').get()
    .then((snapshot)=> {
        snapshot.forEach((doc) => {
            //firebase 인덱스 값 계산
            if (index < doc.data().index) {
                index = doc.data().index;
            }
            var postindex = index + 1;

            //firebase에 게시글 내용 넣기
            let docRef = db.collection('board').doc(firebaseid);

            let setAda = docRef.set({
                index: postindex,
                challenge: challenge,
                title: title,
                content: content,
                writtername: writtername,
                date: today,
                pass: false
            });
        });
    })
    .catch((err) => {
        console.log('Error..', err);
    })
}

app.get('/test', (req, res)=>{
    writeBoard('개인 텀블러 사용하기', '인증해요', '인증~', '윤희나');
})

app.get('/board', (req,res)=>{
    res.render('board');
})

app.get('/rank', (req,res)=>{
    res.render('rank');
})

app.get('/main', (req, res)=>{
    res.render('index');
})

app.get('/MyPage', (req,res)=>{
    res.render('MyPage');
})

app.get('/challenge', (req, res)=>{
    res.render('challenge-main');
})

app.get('/pointshop', (req, res)=>{
    res.render('pointshop');
})

app.get('/CanShow', (req, res)=>{
    res.render('CanShow')
})

app.get('/CanWrite', (req, res)=>{
    res.render('CanWrite');
})

app.post('/CanWrite', (req, res)=>{

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

app.get('/Post/:index', (req, res)=>{
    const index = req.params.index;
    db.collection('board').get()
    .then((snapshot)=> {
        snapshot.forEach((doc) => {
            if(index == doc.data().index)
                console.log(doc.data().index + '번 게시물');
        });
    })
    .catch((err) => {
        console.log('Error..', err);
    })
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
            res.send(`<script type="text/javascript">alert("로그인 성공!");location.href="/main";</script>`);
        } 
    });
})

app.listen(port, (req, res)=>{
    console.log('Server Connected');
})