function LoginPage() {
return (
    <div>
        <div className="signLog-container">
            <h1>Login</h1>
            <form>
                <label>
                Email:
                <input type="email" name="email" required />
                </label>
            </form>
            <form>
                <label>
                Password:
                <input type="password" name="password" required />
                </label>
            </form>
            <button type="submit">Login</button>
        </div>
    </div>
  )
}
export default LoginPage