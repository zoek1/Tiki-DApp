pragma solidity ^0.5.12;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import 'https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';


contract TicketToken is ERC721, Ownable {
    string public constant name = "Ticket Token";
    string public constant symbol = "TIKI";

    struct Event {
        string title;
        string description;
        uint amount;
        address token;
        uint existence;
        uint start;
        uint finish;
        string location;
        uint assistance;
        bool active;
        address payable owner;
    }

    enum Status {
        NONE,
        INITIAL,
        VALIDATED,
        FROOZEN,
        INVALID
    }

    struct Ticket {
        address owner;
        uint eventId;
        Status status;

    }

    Event[] public events;
    Ticket[] public tickets;

    mapping (uint => uint) public coinbalance;
    mapping (uint => mapping (address => uint)) public earned;

    event EventAdded(uint id,  address owner);
    event TicketIssued(uint id, uint eventId,  address buyer);
    event TicketValidated(uint id, uint eventId,  address requester);
    event TransferedTicket(uint eventId, uint ticketId, address beneficiary);


    function createEvent (
        string memory _title,
        string memory  _description,
        uint _amount,
        address _token,
        uint _existence,
        uint _start,
        uint _finish,
        string memory _location) public returns (uint eventId) {

        // validate if event is in validate range date
        require(_start > block.timestamp, "The initial date is invalid");

        Event memory localEvent = Event({
            title:  _title,
            description: _description,
            amount: _amount,
            token: _token,
            existence: _existence,
            start: _start,
            finish: _finish,
            location: _location,
            assistance: 0,
            active: true,
            owner: msg.sender
        });

        eventId = events.push(localEvent) - 1;

        emit EventAdded(eventId, msg.sender);

    }


    function transferFrom(address from, address to, uint256 tokenId) public {

        require(earned[_event][msg.sender] == 0, 'The ticket has been redeemed, couldn\t be transfer');

        tickets[tokenId].owner = to;

        super.transferFrom(from, to, tokenId);
    }


    function mint(uint _event) public payable returns (uint ticketId) {
        Event storage current_event = events[_event];

        // validate event id exists
        require(current_event.active, "The event doesn't exists");


        require(current_event.assistance <= current_event.existence, 'This event is sold');
        // validate if event is in validate range date
        require(current_event.finish > block.timestamp, "The event has expired");


        // Validate user hasnt tiket for this event
        require(earned[_event][msg.sender] == 0, 'You already has a ticket fot this event');


        if (current_event.token == address(0)) {
            require(msg.value == current_event.amount, 'The amount would be equal');
            current_event.owner.transfer(msg.value);
        } else {
            ERC20 ERC20Interface = ERC20(current_event.token);
            require(ERC20Interface.balanceOf(msg.sender) >= current_event.amount);
            ERC20Interface.approve(address(this), current_event.amount);
            ERC20Interface.transferFrom(msg.sender, address(this), current_event.amount);
        }

        Ticket memory issue = Ticket({owner: msg.sender, eventId: _event, status: Status.INITIAL });
        ticketId = tickets.push(issue) - 1;
        coinbalance[_event] += msg.value;
        earned[_event][msg.sender] = ticketId;
        current_event.assistance = current_event.assistance + 1;
        emit TicketIssued(ticketId, _event, msg.sender);
        _mint(msg.sender, ticketId);
    }

    function validate(uint _ticket) public {
        Ticket storage current = tickets[_ticket];
        require(current.status == Status.INITIAL, "Ticket couldn't be redeemed");

        require(msg.sender == current.owner, "Only the owner can validate this ticket");
        current.status = Status.VALIDATED;

        emit TransferedTicket(current.eventId, _ticket, msg.sender);
    }
}