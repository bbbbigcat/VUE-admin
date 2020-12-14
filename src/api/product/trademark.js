import request from "@/utils/request";

const API_NAME = "/admin/product/baseTrademark";
export default {
  /*
  获取品牌列表
  */
  getTradMark(page, limit) {
    return request({
      url: `${API_NAME}/${page}/${limit}`,
      method: "get"
    });
  },

  /*
  修改品牌
  */
  updateTradMark(data) {
    return request({
      url: `${API_NAME}/update`,
      method: "put",
      data
    });
  },

  /*
  新增品牌
  */
  addTradMark(data) {
    return request({
      url: `${API_NAME}/save`,
      method: "post",
      data
    });
  },

  /*
  删除品牌
  */
  delTradMark(id) {
    return request({
      url: `${API_NAME}/remove`,
      method: "delete",
      data: {
        id
      }
    });
  }
};
