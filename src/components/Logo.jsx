export default function Logo({ className = 'h-9 lg:h-8 min-[1700px]:h-10 w-auto' }) {
  return (
    <img
      src="/logo.svg"
      alt="FINS.GE"
      className={`${className} block select-none`}
      draggable={false}
    />
  )
}
