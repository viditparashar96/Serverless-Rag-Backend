import { v2 as cloudinary } from "cloudinary";
export const cloudinary_init = async () => {
  try {
    cloudinary.config({
      cloud_name: "dkzwksrgs",
      api_key: "271732576166511",
      api_secret: "rQjfdHeyjT4bAK07CMJjHgJrawM",
    });
  } catch (error) {
    console.log(error);
  }
};
