import __dirname from "./index.js";
import multer from 'multer';

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        // determinar carpeta segun el fieldname
        let folder = 'documents'; // por defecto

        if(file.fieldname === 'image' || file.fieldname === 'petImage'){
            folder = 'pets';
        } else if(file.fieldname === 'document'){
            folder = 'documents';
        } else if(file.fieldname === 'profile'){
            folder = 'profiles';
        }

        cb(null,`${__dirname}/../public/${folder}`)
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
})

const uploader = multer({storage})

export default uploader;