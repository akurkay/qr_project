<template>
  <div id="app">
    <b-nav tabs align="center">
      <b-nav-item href="/"><h4>Список основных средств</h4></b-nav-item>
      <b-nav-item href="/inventory"><h4>Записанные документы</h4></b-nav-item>
      <b-nav-item href="/active"><h4>Записать новый документ</h4></b-nav-item>
      <b-nav-item href="/scan"><h4>Просканировать информацию</h4></b-nav-item>
    </b-nav>
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name:'app',
}

</script>

