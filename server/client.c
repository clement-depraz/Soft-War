#include <czmq.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Pour avoir un client de test (ex: envoyer ping|null)
// gcc client.c -o ./dist/softwar-client -lczmq -lzmq

int main()
{
    printf("Connecting to server...");
    char *msg;
    zsock_t *req = zsock_new(ZMQ_REQ);
    if (zsock_connect(req, "tcp://localhost:8765") != 0) {
        printf("FAIL\n");
        return EXIT_FAILURE;
    } else {
        printf("SUCCESS...so far...\n");
    }
    
    while(1)
    {
        scanf("%[^\n]%*c", msg);
        if (strcmp(msg, "exit") == 0) {
            break;
        }
        zstr_sendf(req, "%s", msg);

        char *message = zstr_recv(req);
        printf("Received : %s\n", message);
        zstr_free(&message);
    }

    zsock_destroy(&req);
    return 0;
}
