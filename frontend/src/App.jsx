import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import TodoList from "./pages/TodoList";
import { GuestRoute, ProtectedRoute } from "./components/RouteGuards";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<GuestRoute />}>
          <Route path="/signup" element={<Auth key="signup" />} />
          <Route path="/login" element={<Auth key="login" />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/todos" element={<TodoList />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
