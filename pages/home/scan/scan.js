// pages/home/scan/scan.js
import WxValidate from '../../../utils/WxValidate.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    name: '',
    sex: '',
    photo: '',
    house_no: '',
    health_status: '',
    access_times: '',
    is_locked: '',
    form: {   //注意必须在form包裹下，否则equalTo无效
      temperature: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.scanCode({
      onlyFromCamera: true,
      success: res => {
        var data = JSON.parse(res.result)
        this.setData({
          id: data.id,
          name: data.name,
          sex: data.sex,
          photo: data.photo,
          house_no:  data.house_no,
          health_status: data.health_status,
          access_times: data.access_times,
          is_locked: data.is_locked
        })
      }
    }),
    this.initValidate();
  },

  //报错 
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },

  //验证函数
  initValidate() {
    const rules = {
      temperature: {
        required: true,
        range: [30,45]
      }
    }
    const messages = {
      temperature: {
        required: '请填写体温',
        range: '体温范围在30-45之间'
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },

  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    const params = e.detail.value
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }
    console.log(this.form.temperature)
    wx.request({
      url: app.globalData.ip+'/wx/inspector/create-record',
      data: {
        resident_id: this.id,
        inspector_id: app.globalData.id,
        time: Date.parse(new Date()),
        temperature: params.temperature
      },
      success: res => {
        var result = res.data.result
        if(result == 0){
          this.showModal({
            msg: '录入成功'
          })
          wx.navigateTo({
            url: '/pages/home/home'
          })
        } else if (result == 1) {
          this.showModal({
            msg: '录入失败'
          })
          return false
        }
      }
    })
  },
})