<template>
  <div>
    <template slot-scope="{ data }">
      {{ data }}
    </template>
  </div>
</template>

<script>
export default {
  name: 'DiscoverPage',
  data() {
    return {
      baseImageUrl: window.globalConfig.baseAPI,
      paperList: []
    }
  },
  created() {
    // TODO: 获取问卷列表数据
  }
}
</script>