import { Button, ToastAndroid } from "react-native";

        
const ToastNebula = ({title, message}) => {
    const showToast = ()=>{
        ToastAndroid.show(message, ToastAndroid.SHORT);
    }
    return <Button title={title} onPress={showToast} />;
};
export default ToastNebula;