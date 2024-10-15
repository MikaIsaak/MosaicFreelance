import "@stdlib/deploy";
import "./mosaic_deal_contract.tact";
import "./messages.tact";

contract MosaicDealFactory with Deployable {
    init(){}

    /**
    @dev Creates a deal and deploys a child contract.
    @param msg Struct CreateDeal, containing the details of the new deal.
    **/
    receive(msg: DealDetails){
        // require(context().value >= msg.amount, "Insufficient value to create a deal");
        let init: StateInit = initOf MosaicDealContract(msg.id, msg.amount, msg.admin, msg.customer, msg.freelancer);
        send(SendParameters{
                to: contractAddress(init),
                value: context().value,
                mode: SendIgnoreErrors,
                code: init.code,
                data: init.data
            }
        );
    }

    /**
    @dev Returns the address of a child contract based on the deal id.
    @param dealId The id of the deal.
    @return Address of the child contract.
    **/

    get fun addressOfChildren(msg: DealDetails): Address {
        let init: StateInit = initOf MosaicDealContract(msg.id, msg.amount, msg.admin, msg.customer, msg.freelancer);
        return contractAddress(init);
    }
}