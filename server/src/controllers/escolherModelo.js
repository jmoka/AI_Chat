export default function EscolherModelo(modelo) {
    if (modelo === 1) {
        return "qwen-qwq-32b";   
    } else if (modelo === 2) {
        return "qwen-qwq-32b";    
    } else if (modelo === 3) {
        return "deepseek-r1-distill-llama-70b";
    } else if (modelo === 4) {
        return "llama-3.2-11b-vision-preview";
    } else if (modelo === 5) {
        return "llama-3.3-70b-specdec";
    } else if (modelo === 6) {
        return "llama-3.3-70b-versatile";
    } else if (modelo === 7) {
        return "llama3-70b-8192";
    } 
    
}
