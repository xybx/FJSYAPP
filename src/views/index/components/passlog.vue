<template>
  <el-dialog :visible.sync="dialogVisible" :title="title" width="26%" top="28vh" :before-close="handleClose" :append-to-body="true" :close-on-click-modal="false" center>
    <el-form ref="editData" :model="editData" :rules="eRules" status-icon label-width="100px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="editData.oldPassword" type="password" show-password placeholder="请输入原密码" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="editData.newPassword" type="password" show-password placeholder="请输入新密码" />
      </el-form-item>
      <el-form-item label="确认密码" prop="twicePassword">
        <el-input v-model="editData.twicePassword" type="password" show-password placeholder="请输入确认密码" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="medium" @click="saveData">确 定</el-button>
      <el-button size="medium" @click="handleClose">取 消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {editPass} from "@/api/login";
let passRex = /(?=.*[a-z_])(?=.*\d)(?=.*[^a-z0-9_])[\S]{6,}/i;
export default {
  name: "passlog",
  data(){
    let passValid = (rule, value, callback)=>{
      if(!value){
        return callback(new Error('请输入新密码'))
      } else if(value.length < 6){
        return callback(new Error('请输入长度不少于6位密码'))
      }else if(!passRex.test(value)){
        return callback(new Error('请输入由字母、数字、特殊字符三种组成的格式密码'))
      }else {
        callback()
      }
    }
    let TwopassValid = (rule, value, callback)=>{
      let newval = this.editData.newPassword
      if(!value){
        return callback(new Error('请输入确认密码'))
      }else if(value.length < 6){
        return callback(new Error('请输入长度不少于6位密码'))
      }else if(!passRex.test(value)){
        return callback(new Error('请输入由字母、数字、特殊字符三种组成的格式密码'))
      }else if(value !== newval){
        return callback(new Error('两次密码输入的不一致'))
      }else {
        callback()
      }
    }
    return {
      dialogVisible:false,
      title: "",
      editData:{},
      eRules:{
        oldPassword:[{required: true, trigger: "blur", message: "请输入原密码"}],
        newPassword:[{required: true, validator:passValid, trigger: "blur"}],
        twicePassword:[{required: true, validator:TwopassValid, trigger: "blur"}],
      },
    }
  },
  mounted() {
  },
  methods:{
    showEdit(){
      this.title = '修改密码'
      this.dialogVisible = true
    },
    saveData(){
      this.$refs.editData.validate(async (valid)=>{
        if(valid){
          let data = this.editData
          let res = await editPass(data)
          if(res.code == 200){
            this.$message.success('密码修改成功')
            this.handleClose()
          }
        }else {
          return false
        }
      })
    },
    handleClose(){
      this.title = ''
      this.$refs.editData.resetFields()
      this.editData = this.$options.data().editData
      this.dialogVisible = false
    },
  }
}
</script>
<style scoped lang="scss">
::v-deep{
  .el-dialog{
    background:rgba(11, 43, 85, .8);
    border:1px solid rgba(87, 180, 255, 1);
    border-radius: 5px;
    .el-dialog__header{
      padding:10px 20px;
      background: linear-gradient(90deg, rgba(58, 158, 240, 1) 0% ,transparent 72%);
      .el-dialog__title{
        color: #fff;
      }
      .el-dialog__headerbtn .el-dialog__close{
        color: #fff;
      }
    }
    .el-dialog__body{
      .el-form{
        .el-form-item{
          .el-form-item__label{
            color:rgba(255, 255, 255, .6);
          }
          .el-input{
            .el-input__inner{
              height:36px;
              line-height:36px;
              color:#fff;
              font-size:15px;
              background: rgba(11, 161, 248, .5);
              border:1px solid rgba(111, 178, 252, 1);
              border-radius:2px;
              &::placeholder{
                font-size:13px;
                color: rgba(255, 255, 255, .3);
              }
            }
          }
        }
      }
    }
    .el-dialog__footer{
      .dialog-footer{
        .el-button--medium{
          padding: 10px 30px;
          &.el-button--primary{
            background-color:rgba(49, 179, 255, 1);
          }
          &.el-button--default{
            background: none;
            border:2px solid rgba(49, 179, 255, 1);
            color: #fff;
          }
        }
      }
    }
  }
}
</style>