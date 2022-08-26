import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";

//Redux
import {useSelector, useDispatch} from "react-redux";
import {getOrder, orderReset, orderPay} from "../features/order/orderSlice";

//Components
import Alert from "../components/Globals/Alert";
import PayPal from "../components/OrderDetail/PayPal";

const OrderDetail = () => {
  //Declarations
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {orderId} = useParams();

  //Global states
  const {order, isError, message} = useSelector(store => store.order);
  const {user} = useSelector(store => store.auth);

  //Component States (PayPal)
  const [paymentError, setPaymentError] = useState({value: false, message: ""});

  //reset on unmount
  useEffect(() => {
    return () => {
      dispatch(orderReset());
    };
  }, [dispatch]);

  //Fetch order detail
  useEffect(() => {
    if (!user) navigate("/login");
    if (Object.keys(order).length === 0) dispatch(getOrder(orderId));
  }, [dispatch, navigate, user, order, orderId]);

  const handlePayment = paymentResult => {
    dispatch(orderPay({orderId, paymentResult}));
  };

  //calculate items price
  const getItemsPrice = () => {
    let num = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let response = (Math.round(num * 100) / 100).toFixed(2);
    return response;
  };

  return (
    <>
      {Object.keys(order).length !== 0 && (
        <>
          {paymentError.value && <div>{<Alert type={"danger"} text={paymentError.message} />}</div>}
          {isError && <Alert type={"danger"} text={message} />}

          <h4 className="container-md text-center mx-3 mt-1">ORDER {order._id}</h4>
          <div className="container-md mx-auto row p-2">
            <div className="col-md-7 p-0 me-2">
              <div className="mt-1">
                <h4>SHIPPING</h4>
                <p>
                  <strong>Name :</strong> {order.user.name} <br />
                  <strong>Email :</strong> {order.user.email} <br />
                  <strong>Address : </strong>
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>

                {order.isDelivered ? (
                  <Alert type="success" text={`Delivered on {order.deliveredAt}`} />
                ) : (
                  <Alert type="danger" text={`Not Delivered`} />
                )}

                <hr />
              </div>

              <div>
                <h4>PAYMENT METHOD</h4>
                <strong>Method: </strong>
                {order.paymentMethod}

                {order.isPaid ? (
                  <Alert type="success" text={`Paid on ${order.paidAt}`} />
                ) : (
                  <Alert type="danger" text={`Not paid`} />
                )}
                <hr />
              </div>

              <div className="mt-4">
                <h4> ORDER ITEMS</h4>

                {order.orderItems.map((item, index) => (
                  <div className="row" key={index}>
                    <div className="col-2">
                      <img src={item.image} alt={item.name} style={{width: 60, height: 50}} />
                    </div>
                    <div className="col-7">{item.name}</div>
                    <div className="col-3">
                      {item.quantity} x ${item.price} = ${(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <hr />
            </div>

            <div className="col-md-4 border mt-4 minHeight pb-3">
              <h4>ORDER SUMMARY</h4>
              <div className="d-flex justify-content-between">
                <div>Items</div>
                <div>{getItemsPrice()} ብር </div>
              </div>
              <div className="d-flex justify-content-between">
                <div>Shipping</div>
                <div>{order.shippingPrice} ብር</div>
              </div>
              <div className="d-flex justify-content-between">
                <div>Tax</div>
                <div>{order.taxPrice} ብር</div>
              </div>
              <div className="d-flex justify-content-between">
                <div>Total</div>
                <div>{order.totalPrice} ብር</div>
              </div>
              {!order.isPaid && (
                <PayPal
                  price={order.totalPrice}
                  setPaymentError={setPaymentError}
                  handlePayment={handlePayment}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default OrderDetail;
