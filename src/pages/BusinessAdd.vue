<template>
  <div class="title">
    <va-card
      color="danger"
      :style="{
        transform: `translateX(${ exchange ? left + 'px' : 0 })`
      }"
    >
      <va-card-content>购入</va-card-content>
    </va-card>
    <va-button preset="primary" @click="change"><span class="icon icon-exchange"></span></va-button>
    <va-card 
      color="primary"
      ref="saleTitle" 
      :style="{
        transform: `translateX(${ exchange ? -left + 'px' : 0 })`
      }"
    >
      <va-card-content>卖出</va-card-content>
    </va-card>
  </div>
  <va-form class="form">
    <va-card stripe :stripe-color="exchange ? 'primary' :'danger'">
      <va-card-title>现货纯铜</va-card-title>
      <va-card-content>
        <va-input class="form-control" label="价格（元）" v-model="pure.price" @blur="fill(futures, 'price', pure.price)"></va-input>
        <va-input class="form-control" label="数量（吨）" v-model="pure.num" @blur="fill(futures, 'num', pure.num)"></va-input>
      </va-card-content>
    </va-card>
    <va-card stripe :stripe-color="exchange ? 'danger' :'primary'">
      <va-card-title>期货纯铜</va-card-title>
      <va-card-content>
        <va-input class="form-control" label="价格（元）" v-model="futures.price" @blur="fill(pure, 'price', futures.price)"></va-input>
        <va-input class="form-control" label="数量（吨）" v-model="futures.num" @blur="fill(pure, 'num', futures.num)"></va-input>
      </va-card-content>
    </va-card>
    <va-card stripe :stripe-color="exchange ? 'primary' :'danger'">
      <va-card-title>现货废铜</va-card-title>
      <va-card-content>
        <va-input class="form-control" label="价格（元）" v-model="impure.price"></va-input>
        <va-input class="form-control" label="数量（吨）" v-model="impure.num"></va-input>
      </va-card-content>
    </va-card>
    <va-button :style="{ gridColumn: '1 / span 2' }">保存</va-button>
  </va-form>
</template>

<script setup>
import { ref } from 'vue';

const saleTitle = ref(null);
const exchange = ref(false);
let left = ref(0);
function data () {
  return {
    num: '',
    price: '',
  };
}
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