<template>
  <div class="title">
    <va-card
      :color="PURCHASE_COLOR"
      :style="{
        transform: `translateX(${ exchange ? left + 'px' : 0 })`
      }"
    >
      <va-card-content>购入</va-card-content>
    </va-card>
    <va-button preset="primary" @click="change"><va-icon  name="autorenew"></va-icon></va-button>
    <va-card 
      :color="SOLD_COLOR"
      ref="saleTitle" 
      :style="{
        transform: `translateX(${ exchange ? -left + 'px' : 0 })`
      }"
    >
      <va-card-content>卖出</va-card-content>
    </va-card>
  </div>
  <va-form class="form">
    <va-card stripe :stripe-color="exchange ? SOLD_COLOR : PURCHASE_COLOR ">
      <va-card-title>现货纯铜</va-card-title>
      <va-card-content>
        <va-input class="form-control" type="number" label="价格（元）" v-model="pure.price" @blur="fill(futures, 'price', pure.price)"></va-input>
        <va-input class="form-control" type="number" label="数量（吨）" v-model="pure.num" @blur="fill(futures, 'num', pure.num)"></va-input>
      </va-card-content>
    </va-card>
    <va-card stripe :stripe-color="exchange ? PURCHASE_COLOR : SOLD_COLOR ">
      <va-card-title>期货纯铜</va-card-title>
      <va-card-content>
        <va-input class="form-control" type="number" label="价格（元）" v-model="futures.price" @blur="fill(pure, 'price', futures.price)"></va-input>
        <va-input class="form-control" type="number" label="数量（吨）" v-model="futures.num" @blur="fill(pure, 'num', futures.num)"></va-input>
      </va-card-content>
    </va-card>
    <va-card stripe :stripe-color="exchange ? SOLD_COLOR : PURCHASE_COLOR ">
      <va-card-title>现货废铜</va-card-title>
      <va-card-content>
        <va-input class="form-control" type="number" label="价格（元）" v-model="impure.price"></va-input>
        <va-input class="form-control" type="number" label="数量（吨）" v-model="impure.num"></va-input>
      </va-card-content>
    </va-card>
    <va-button :loading="inserting" :color="SOLD_COLOR" :style="{ gridColumn: '1 / span 2' }" @click="submit">保存</va-button>
  </va-form>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vuestic-ui/web-components';
import * as constant from '@/constant';
import _ from 'lodash';

function data () {
  return {
    num: '',
    price: '',
  };
}
const SOLD_COLOR = '#3f5ec1';
const PURCHASE_COLOR = '#e45050';
const { init } = useToast();
const inserting = ref(false);
const saleTitle = ref(null);
const exchange = ref(false);
const left = ref(0);
const futures = ref(data());
const pure = ref(data());
const impure = ref(data());
function change () {
  left.value = saleTitle.value.$el.offsetLeft;
  exchange.value = !exchange.value;
}

function fill (target, key, value) {
  if(!target[key]) {
    target[key] = value;
  }
}

function validate () {
  /**
   * @param {ReturnType<typeof data>} val
   */
  function checkFull (val) {
    if(val.num && val.price) {
      return true;
    } else {
      if(val.num || val.price) {
        throw Error('请完整填写数量和价格');
      } else {
        return false;
      }
    }
  }
  if(!(pure.value || impure.value) || !checkFull(futures.value)) {
    throw Error('购入和卖出均需填写至少一项');
  }
}

function clear () {
  pure.value = data();
  impure.value = data();
  futures.value = data();
}

function insert ({ goodsId, goodsType, price, total }) {
  const now =new Date().valueOf();
  const id = now + `-${goodsId}-${goodsType}`;
  const createTime = now;
  const sql =
    `INSERT INTO "business"
      ("id", "create_time", "goods_id", "goods_type", "price", "total") 
      VALUES
      ("${id}", ${createTime}, ${goodsId}, ${goodsType}, ${price}, ${total})`;
  return electron.exec(sql); 
}
async function submit() {
  inserting.value = true;
  const inserts = [];
  function i (dataRef, id, type, isSale = false) {
    if(dataRef.value.num) {
      inserts.push(
        insert({
          goodsId: id,
          goodsType: type,
          price: dataRef.value.price,
          total: dataRef.value.num * (isSale ? -1 : 1)
        })
      );
    }
  }
  try {
    validate();
    i(pure, constant.GOODS_ID_PURE, constant.GOODS_TYPE_SPOT, exchange.value);
    i(impure, constant.GOODS_ID_IMPURE, constant.GOODS_TYPE_SPOT, exchange.value);
    i(futures, constant.GOODS_ID_PURE, constant.GOODS_TYPE_FUTURES, !exchange.value);
    await Promise.all(inserts);
    clear();
  } catch (error) {
    init({
      message: error.message,
      duration: 2000,
      closeable: false,
      color: 'warning'
    });
  }
  inserting.value = false;
}

</script>

<style lang="scss" scoped>
.title{
  display:  flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  .va-card{
    flex: 1 1 auto;
    text-align: center;
    transition: all 0.4s ease-in-out;
  }
}

.form{
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 65px;
}
.form-control{
  display: block;
  &+&{
    margin-top: 10px;
  }
}
</style>