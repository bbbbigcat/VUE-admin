<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="add">添加</el-button>
    <el-dialog
      :title="`${form.id ? '修改品牌' : '添加品牌'}`"
      :visible.sync="isshowMessage"
      width="30%"
      right
      ref="judgereq"
    >
      <el-form :model="form" :rules="rules" ref="form">
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <!-- 品牌Logo模块 -->
        <el-form-item label="品牌LOGO" prop="logoUrl">
          <!-- 如果允许跨域
            action="http://182.92.128.115/admin/product/fileUpload"
            目标服务器地址：代理配置中（vue.config.js)

          如果不允许跨域，就使用proxy
            action="/dev-api/admin/product/fileUpload"
            /dev-api -> request.js 代理
            在main.js中定义Vue.prototype.$Base_API = process.env.VUE_APP_BASE_API -->
          <el-upload
            class="avatar-uploader"
            :action="`${$BASE_API}/admin/product/fileUpload`"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <p>只能上传jpg/png文件，且不超过1mb</p>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isshowMessage = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
      </span>
    </el-dialog>

    <template>
      <el-table :data="trademarkList" border style="width: 100%" class="tablex">
        <!-- 如果需要更改样式在element-ui官方文档可以找到对应属性 -->
        <el-table-column
          prop="Id"
          label="序号"
          width="80"
          align="center"
          type="index"
          :index="1"
        >
        </el-table-column>
        <el-table-column prop="tmName" label="品牌名称"> </el-table-column>
        <el-table-column label="品牌LOGO">
          <template slot-scope="scope">
            <img :src="scope.row.logoUrl" style="width: 180px" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-button type="warning" icon="el-icon-share" @click="updata(row)"
              >修改</el-button
            >
            <el-button type="danger" icon="el-icon-delete" @click="del(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="block" style="margin-top: 20px" align="center">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :total="total"
          layout="prev, pager, next, jumper, ->,sizes, total"
          :page-sizes="[3, 6, 9]"
          :page-size="limit"
        >
        </el-pagination>
      </div>
    </template>
  </div>
</template>

<script>
import { trademark } from "@/api";
export default {
  name: "TrademarkList",
  data() {
    return {
      trademarkList: [],
      page: 1,
      limit: 3,
      total: 0,
      isshowMessage: false,
      form: {
        tmName: "",
        logoUrl: "",
      },
      // formLabelWidth: "120px",
      rules: {
        // 表单校验规则
        tmName: [
          {
            // 必填项
            required: true,
            // 错误信息
            message: "请输入品牌名称",
            // 触发表单校验时机
            trigger: "blur",
          },
        ],
        logoUrl: [{ required: true, message: "请上传品牌LOGO" }],
      },
    };
  },
  methods: {
    del() {
      console.log(this.row);
    },
    add() {
      this.isshowMessage = true;
      this.form = {};
    },
    handleSizeChange(limit) {
      this.limit = limit;
      this.getTradeMarkList();
    },
    handleCurrentChange(page) {
      this.getTradeMarkList(page);
    },
    onSubmit(form) {
      // 校验表单
      this.$nextTick(
        this.$refs[form].validate(async (valid) => {
          if (valid) {
            // 表单校验通过
            // console.log(this.trademarkFrom);
            // 发送请求
            // 判断titel是修改还是添加，根据值发送不同的请求
            if (this.$refs.judgereq.title === "添加品牌") {
              const result = await this.$API.trademark.addTradMark(this.form);
              if (result.code === 200) {
                this.$message.success("添加品牌数据成功···");
                this.isshowMessage = false; // 隐藏对话框
                this.$API.trademark.getTradMark(this.page, this.limit);
              } else {
                this.$message.error(result.message);
              }
            } else {
              const result = await this.$API.trademark.updateTradMark(
                this.form
              );
              if (result.code === 200) {
                this.$message.success("修改品牌数据成功···");
                this.isshowMessage = false; // 隐藏对话框
                this.$API.trademark.getTradMark(this.page, this.limit);
                this.getTradeMarkList(); // 修改成功后重新请求
              } else {
                this.$message.error(result.message);
              }
            }
          }
        })
      );
    },
    // 上传图片成功的回调
    handleAvatarSuccess(res) {
      console.log(res); // 图片地址
      this.form.logoUrl = res.data;
    },
    // 上传图片之前的回调
    beforeAvatarUpload(file) {
      // const imgTypes = ["image/jpg", "image/png", "image/jpeg"];
      // 检测文件类型;
      // const isValidType = imgTypes.indexOf(file.type) > -1;
      // 检测文件大小;
      const isLt = file.size / 1024 < 1024;

      // if (!isValidType) {
      //   this.$message.error("上传品牌LOGO只能是 JPG 或 PNG 格式!");
      // }
      if (!isLt) {
        this.$message.error("上传品牌LOGO大小不能超过 1 mb!");
      }
      // 返回值为true，代表可以上传
      // 返回值为false，代表不可以上传
      return isLt;
    },
    async getTradeMarkList(page = 1) {
      try {
        this.page = page;
        const result = await this.$API.trademark.getTradMark(
          this.page,
          this.limit
        );
        if (result.code === 200) {
          this.$message.success("获取分页列表成功");
          this.trademarkList = result.data.records;
          this.total = result.data.total;
        } else {
          this.$message.error("获取分页列表失败");
        }
      } catch (e) {
        console.log(e);
      }
    },
    updata(row) {
      this.isshowMessage = true;
      console.log(111);
      this.form = { ...row };
      this.
    },
  },
  async mounted() {
    this.getTradeMarkList();
  },
};
</script>
<style lang="css">
.tablex {
  margin-top: 20px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
