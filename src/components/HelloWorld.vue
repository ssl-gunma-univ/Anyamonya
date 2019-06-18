<template>
  <div class="hello">
    {{msg}}
    <div>
      <!-- <img v-if="indexnum == -1" alt="Vue logo" src="../assets/PrairieDogCards/-5.jpg"> -->
      <img alt="imege" :src="image">
    </div>
    <span v-if="named">名前 : {{cardname}}</span>
    <div>
      <div>
        <input
          @keyup.enter="saveName"
          v-model="name"
          :disabled="named||carddrew[indexnum]"
          type="text"
          placeholder="Type a name..."
        >
        <button type="button" @click="saveName" :disabled="named||carddrew[indexnum]">命名</button>
      </div>
    </div>

    <div>
      <button @click="fornextimage" :disabled="!named||nextclicked">次へ</button>
    </div>
    Stock : {{stock}}
    <div v-for="(message,index) in messages" :key="index">
      <div>
        <span>
          <b>{{message.username}}</b>
          : {{message.message}}
        </span>

        <small>({{displayTime(message)}})</small>
      </div>
    </div>

    <div>
      <div>
        <input
          @keyup.enter="saveMessage"
          v-model="message"
          type="text"
          placeholder="Type a message..."
        >
        <button type="button" @click="saveMessage">送信</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";

export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  data() {
    return {
      image: require("@/assets/PrairieDogCards/card.jpg"),
      indexnum: -1, //最初のカードは待機カードで命名しない。最初に次へをクリックすると0になる。
      card: [-10, -5, 0, 1, 2, 3, 4, 5, 10, 20], //カードの種類兼カードのファイル名。imageにこのファイル名が代入される。
      cardnames: [], //カードの名前入る。保存用。
      carddrew: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ], //一度ドローされる(名付けられる)とtrueになり、複数回名付けされない。カードの種類だけ用意。
      stock: 0, //獲得できる枚数
      name: "", //カードの名前入力フォーム用
      username: "User1", // プレイヤーの名前、名付け親とチャットの保存に使用。
      named: true, //名付けられるとtrueになる。
      nextclicked: false, //次へがクリックされるとtureになる。
      cardname: "", //名付けたあとにディスプレイ用(カードの名前)
      message: "", //チャットのディスプレイ用
      messages: [] //チャットの取得用
    };
  },
  watch: {
    nextclicked: function(newNextclicked, oldNextclicked) {
      if (newNextclicked) {
        setTimeout(this.nextimage, 3000);
      }
    }
  },

  methods: {
    fornextimage: function() {
      this.nextclicked = true;

      const jsFrame2 = new JSFrame();
      jsFrame2.showToast({
        width: 260, //幅
        height: 100, //高さ
        duration: 2000, //表示時間(millis)
        align: "top", // 表示位置 'top'/'center'/'bottom'(default)
        style: {
          borderRadius: "2px",
          backgroundColor: "rgba(0,124,255,0.8)"
          // backgroundColor: "rgba(255,0,0,0.8)"
        },
        html:
          '<span style="color:white;">3秒後に次のカードが表示されます…</span>',
        closeButton: true, //閉じるボタンを表示
        closeButtonColor: "white" //閉じるボタンの色
      });
    },
    nextimage: function() {
      if (this.indexnum === 9) {
        this.indexnum = 0;
      } else {
        this.indexnum = this.indexnum + 1;
      }
      if (this.carddrew[this.indexnum]) {
        this.saveActionMessage();
      }
      this.stock = this.stock + 1;
      this.image = require("@/assets/PrairieDogCards/" +
        this.card[this.indexnum] +
        ".jpg");
      this.named = false;
      this.name = "";
      this.nextclicked = false;
    },
    saveName: function() {
      if (!this.named && this.name.length !== 0) {
        db.collection("rooms")
          .doc("1")
          .collection("card")
          .doc(`${this.indexnum}`)
          .set({
            message: this.name,
            createdAtJapan: new Date(),
            createdAt: this.timestamp(),
            username: this.username
          })
          .then(function(docRef) {
            // console.log("Document written with ID: ", docRef.id);
          })
          .catch(function(error) {
            console.error("Error adding document: ", error);
          });
        this.cardname = this.name;
        this.cardnames[this.indexnum] = this.cardname;
        
        this.carddrew[this.indexnum] = true;
      
        this.name = "";
        this.named = true;
      }
    },
    timestamp: function() {
      let date = new Date();
      let timestamp = date.getTime();
      return Math.floor(timestamp / 1000);
    },
    saveMessage() {
      if (this.message.length != 0) {
        db.collection("rooms")
          .doc("1")
          .collection("chat")
          .add({
            message: this.message,
            createdAtJapan: new Date(),
            createdAt: this.timestamp(),
            username: this.username
          })
          .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
          })
          .catch(function(error) {
            console.error("Error adding document: ", error);
          });
        this.message = "";
      }
    },
    saveActionMessage() {
      
        db.collection("rooms")
          .doc("1")
          .collection("chat")
          .add({
            message: "このカードの名前は？",
            createdAtJapan: new Date(),
            createdAt: this.timestamp(),
            username: "システム"
          })
          .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
          })
          .catch(function(error) {
            console.error("Error adding document: ", error);
          });
        this.message = "";
      
    },
    fetchMessage() {
      db.collection("rooms")
        .doc("1")
        .collection("chat")
        .orderBy("createdAt")
        .onSnapshot(querySnapshot => {
          let allMessages = [];
          querySnapshot.forEach(doc => {
            allMessages.push(doc.data());
            console.log(`${doc.id} => ${doc.data()}`);
          });
          this.messages = allMessages;
        });
    },
    displayTime: function(message) {
      let timestamp = message.createdAt * 1000;
      var date = new Date(timestamp);
      var diff = new Date().getTime() - date.getTime();
      var d = new Date(diff);

      if (d.getUTCFullYear() - 1970) {
        // return d.getUTCFullYear() - 1970 + "年前";
        return "1秒前";
      } else if (d.getUTCMonth()) {
        return d.getUTCMonth() + "ヶ月前";
      } else if (d.getUTCDate() - 1) {
        return d.getUTCDate() - 1 + "日前";
      } else if (d.getUTCHours()) {
        return d.getUTCHours() + "時間前";
      } else if (d.getUTCMinutes()) {
        return d.getUTCMinutes() + "分前";
      } else {
        return d.getUTCSeconds() + "秒前";
      }
    }
  },
  created() {
    this.fetchMessage();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
