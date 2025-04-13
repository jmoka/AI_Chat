export function InstrucoesSistema(orientacao) {
    return {
        role: "system",
        content: orientacao || "vc é um asistente de pidas ajude a criar piadas",
    };
}
