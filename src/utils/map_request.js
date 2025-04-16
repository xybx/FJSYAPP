import esriId from '@arcgis/core/identity/IdentityManager';

async function get3DToken() {
    esriId.tokenValidity = 60 * 24;
    const { token } = await esriId.generateToken(
        {
            // server: 'http://192.168.1.146:6080/arcgis/rest/services/FJSY/FJSY/MapServer',
            tokenServiceUrl: window.tokenServiceUrl,
        },
        {
            username: window.username,
            password: window.password,
        }
    );
    if (token) {
        sessionStorage.setItem("arcgisToken", token);
        esriId.registerToken({
            server: window.server,
            token,
        });
    }
}

export default get3DToken