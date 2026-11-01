#ifdef CSDM_DEV_COMMANDS

#include <cstdlib>

#include "icvar.h"
#include "net_messages.h"

CON_COMMAND(csdm_dump_net_messages,
            "Prints the network messages registered in the client, usage: csdm_dump_net_messages [maxId]") {
    int maxId = args.ArgC() > 1 ? atoi(args.Arg(1)) : 600;
    DumpNetworkMessages(maxId);
}

#endif
