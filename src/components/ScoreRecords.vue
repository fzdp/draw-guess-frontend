<template>
    <div>
        <div class="header-primary">
            <div class="header-left">
                <button class="btn-back" @click="$router.back()"></button>
            </div>
            <div class="header-center">
                我的积分
            </div>
        </div>

        <div class="container container-fixed">
            <template v-if="records.length">
                <p class="records-title">您当前有{{records.length}}条积分变动记录</p>
                <div class="row records-header">
                    <div class="col">时间</div>
                    <div class="fixed-col">积分变动</div>
                    <div class="col">原因</div>
                </div>

                <div class="records-container">
                    <div class="row" v-for="item in records" :key="item.id">
                        <div class="col">{{formatTime(item.created_at)}}</div>
                        <div class="fixed-col">+{{item.score}}</div>
                        <div class="col">{{item.reason_detail}}</div>
                    </div>
                </div>
            </template>

            <template v-else>
                <p class="records-title">您当前暂无积分变动记录</p>
            </template>
        </div>
    </div>
</template>

<script>
  export default {
    data() {
      return {
        records: []
      }
    },
    methods: {
      formatTime(val) {
        const date = new Date(val);
        return `${date.getMonth() + 1}月${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
      }
    },
    created() {
      this.$api.get("/score_records").then((res) => {
        this.records = res.data.data;
      })
    }
  }
</script>

<style scoped>
    .records-container > .row {
        border-bottom: 1px solid #8fd9a8;
    }

    .records-header {
        font-weight: bold;
    }

    .records-title {
        margin-bottom: 10px;
    }

    .row > * {
        padding: 10px;
    }

    .fixed-col {
        width: 90px;
    }
</style>
